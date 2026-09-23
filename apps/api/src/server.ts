import Fastify, { type FastifyReply } from 'fastify';
import { createRedis } from '../../../adapters/redis/src/index.js';
import { ApiError, errorEnvelope } from './errors.js';
import { buildRequestContext, type RequestContext } from './request-context.js';
import {
  enforceRateLimit,
  MemoryFixedWindowLimiter,
  RedisFixedWindowLimiter,
  type RateLimitResult,
  type RateLimiter,
} from './rate-limit.js';
import { createApiIdempotencyStore } from './idempotency.js';
import { parsePage } from './pagination.js';
import { authenticate } from './auth.js';

declare module 'fastify' {
  interface FastifyRequest {
    platformContext: RequestContext;
  }
}

const app = Fastify({
  logger: true,
  bodyLimit: 1024 * 1024,
  requestTimeout: 15_000,
  connectionTimeout: 10_000,
});

const production = process.env.NODE_ENV === 'production';
const redis = process.env.REDIS_URL ? createRedis() : null;

if (production && !redis) {
  throw new Error('REDIS_URL is required in production for distributed request quotas');
}

function buildLimiter(
  prefix: string,
  max: number,
  windowMs: number,
): RateLimiter {
  return redis
    ? new RedisFixedWindowLimiter(redis, prefix, max, windowMs)
    : new MemoryFixedWindowLimiter(max, windowMs);
}

const requestLimiter = buildLimiter(
  'rate:request',
  Number(process.env.API_RPM ?? 600),
  60_000,
);

const configuredDailyQuota = Number(process.env.API_DAILY_QUOTA ?? 0);
const tenantDailyQuota =
  Number.isFinite(configuredDailyQuota) && configuredDailyQuota > 0
    ? buildLimiter('rate:daily', configuredDailyQuota, 86_400_000)
    : null;

const idempotency = createApiIdempotencyStore();
const publicPaths = new Set([
  '/health',
  '/health/live',
  '/health/ready',
  '/health/startup',
]);

function applyRateHeaders(
  reply: FastifyReply,
  result: RateLimitResult,
  prefix = 'x-ratelimit',
): void {
  const resetSeconds = Math.max(0, Math.ceil((result.resetAt - Date.now()) / 1_000));
  reply
    .header(`${prefix}-limit`, String(result.limit))
    .header(`${prefix}-remaining`, String(result.remaining))
    .header(`${prefix}-reset`, String(Math.ceil(result.resetAt / 1_000)));

  if (!result.allowed) {
    reply.header('retry-after', String(resetSeconds));
  }
}

app.addHook('onRequest', async (request, reply) => {
  request.platformContext = buildRequestContext(request.headers as Record<string, unknown>);

  reply
    .header('x-request-id', request.platformContext.requestId)
    .header('x-correlation-id', request.platformContext.correlationId)
    .header('X-Content-Type-Options', 'nosniff')
    .header('Referrer-Policy', 'strict-origin-when-cross-origin')
    .header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  const path = request.url.split('?')[0] ?? '';
  if (publicPaths.has(path)) {
    return;
  }

  request.platformContext.tenant = await authenticate(request.headers.authorization);

  const tenantId = request.platformContext.tenant.tenantId;
  const workspaceId = request.platformContext.tenant.workspaceId ?? '_root';
  const route = request.routeOptions.url || path;
  const limitKey = `${tenantId}:${workspaceId}:${route}`;

  const requestLimit = await requestLimiter.consume(limitKey);
  applyRateHeaders(reply, requestLimit);
  enforceRateLimit(requestLimit);

  if (tenantDailyQuota) {
    const quota = await tenantDailyQuota.consume(tenantId);
    applyRateHeaders(reply, quota, 'x-quota');
    enforceRateLimit(quota, 'QUOTA_EXCEEDED', 'Tenant daily request quota exceeded');
  }
});

app.setErrorHandler((error, request, reply) => {
  const requestId = request.platformContext?.requestId ?? request.id;

  if (error instanceof ApiError) {
    return reply
      .code(error.statusCode)
      .send(errorEnvelope(error.code, error.message, requestId));
  }

  if ((error as { validation?: unknown }).validation) {
    return reply
      .code(400)
      .send(errorEnvelope('VALIDATION_ERROR', 'Request validation failed', requestId));
  }

  const safeError = error instanceof Error ? error : new Error('Unknown error');
  request.log.error(
    {
      err: { name: safeError.name, message: safeError.message },
      requestId,
      tenantId: request.platformContext?.tenant?.tenantId,
    },
    'request failed',
  );

  return reply
    .code(500)
    .send(errorEnvelope('INTERNAL_ERROR', 'An internal error occurred', requestId));
});

app.get('/health/live', async () => ({
  status: 'HEALTHY',
  service: 'api',
  uptimeSeconds: Math.floor(process.uptime()),
}));

app.get('/health/startup', async (_request, reply) => {
  const idem = await idempotency.health();
  const healthy = idem.status !== 'UNHEALTHY';

  return reply.code(healthy ? 200 : 503).send({
    status: healthy ? 'HEALTHY' : 'UNHEALTHY',
    dependencies: { idempotency: idem },
  });
});

app.get('/health/ready', async (_request, reply) => {
  const idem = await idempotency.health();
  const ready = idem.status !== 'UNHEALTHY';

  return reply.code(ready ? 200 : 503).send({
    status: ready ? 'HEALTHY' : 'DEGRADED',
    dependencies: { idempotency: idem },
  });
});

// Keep the original endpoint for existing clients while making readiness
// semantics explicit for container orchestrators.
app.get('/health', async (_request, reply) => {
  const idem = await idempotency.health();
  const ready = idem.status !== 'UNHEALTHY';

  return reply.code(ready ? 200 : 503).send({
    status: ready ? 'HEALTHY' : 'DEGRADED',
    dependencies: { idempotency: idem },
  });
});

app.get('/v1/meta/capabilities', async (request) => ({
  features: {
    documents: true,
    chat: true,
    analytics: true,
    workflow: false,
  },
  permissions: request.platformContext.tenant?.permissions ?? [],
}));

app.get<{ Querystring: { limit?: string; cursor?: string } }>(
  '/v1/items',
  {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'string' },
          cursor: { type: 'string' },
        },
        additionalProperties: false,
      },
    },
  },
  async (request) => {
    const page = parsePage(request.query as unknown as Record<string, unknown>);
    return { items: [], nextCursor: undefined, limit: page.limit };
  },
);

app.post<{ Body: { name: string } }>(
  '/v1/resources',
  {
    schema: {
      headers: {
        type: 'object',
        properties: {
          'idempotency-key': { type: 'string', minLength: 8, maxLength: 200 },
        },
        required: ['idempotency-key'],
      },
      body: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 200 },
        },
        additionalProperties: false,
      },
    },
  },
  async (request, reply) => {
    const tenant = request.platformContext.tenant!;
    const key = `${tenant.tenantId}:${tenant.workspaceId ?? '_root'}:${String(
      request.headers['idempotency-key'],
    )}`;

    const cached = await idempotency.get(key);
    if (cached) {
      return reply.code(cached.status).send(JSON.parse(cached.body));
    }

    const candidate = {
      id: crypto.randomUUID(),
      tenantId: tenant.tenantId,
      name: request.body.name,
    };

    const committed = await idempotency.commitOrRead(key, 201, candidate);
    return reply.code(committed.status).send(JSON.parse(committed.body));
  },
);

if (process.env.NODE_ENV !== 'test') {
  app.listen({
    port: Number(process.env.PORT ?? 8080),
    host: '0.0.0.0',
  });
}

export { app };
