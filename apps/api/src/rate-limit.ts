import { ApiError } from './errors.js';

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

export interface RateLimiter {
  consume(key: string): Promise<RateLimitResult>;
}

interface WindowState {
  count: number;
  resetAt: number;
}

export class MemoryFixedWindowLimiter implements RateLimiter {
  private readonly windows = new Map<string, WindowState>();
  private operations = 0;

  constructor(
    private readonly max: number,
    private readonly windowMs: number,
    private readonly maxTrackedKeys = 50_000,
  ) {
    if (!Number.isFinite(max) || max <= 0) {
      throw new Error('INVALID_LIMIT_MAX');
    }
    if (!Number.isFinite(windowMs) || windowMs <= 0) {
      throw new Error('INVALID_LIMIT_WINDOW');
    }
  }

  async consume(key: string): Promise<RateLimitResult> {
    const now = Date.now();
    this.operations += 1;

    if (this.operations % 1_000 === 0 || this.windows.size >= this.maxTrackedKeys) {
      this.removeExpired(now);
    }

    const current = this.windows.get(key);
    if (!current || current.resetAt <= now) {
      const resetAt = now + this.windowMs;
      this.windows.set(key, { count: 1, resetAt });
      return { allowed: true, limit: this.max, remaining: this.max - 1, resetAt };
    }

    if (current.count >= this.max) {
      return { allowed: false, limit: this.max, remaining: 0, resetAt: current.resetAt };
    }

    current.count += 1;
    return {
      allowed: true,
      limit: this.max,
      remaining: Math.max(0, this.max - current.count),
      resetAt: current.resetAt,
    };
  }

  clear(key?: string): void {
    if (key) {
      this.windows.delete(key);
      return;
    }
    this.windows.clear();
  }

  private removeExpired(now: number): void {
    for (const [key, window] of this.windows) {
      if (window.resetAt <= now) {
        this.windows.delete(key);
      }
    }

    // A bounded fallback is preferable to an unbounded process-level map in
    // development. Production uses Redis, so this path is never the global
    // quota authority in a multi-replica deployment.
    while (this.windows.size > this.maxTrackedKeys) {
      const oldestKey = this.windows.keys().next().value as string | undefined;
      if (!oldestKey) {
        break;
      }
      this.windows.delete(oldestKey);
    }
  }
}

export interface RedisRateLimitClient {
  eval(script: string, numberOfKeys: number, ...args: Array<string | number>): Promise<unknown>;
}

const CONSUME_WINDOW_SCRIPT = `
local count = redis.call('INCR', KEYS[1])
if count == 1 then
  redis.call('PEXPIRE', KEYS[1], ARGV[1])
end
local ttl = redis.call('PTTL', KEYS[1])
return {count, ttl}
`;

export class RedisFixedWindowLimiter implements RateLimiter {
  constructor(
    private readonly redis: RedisRateLimitClient,
    private readonly prefix: string,
    private readonly max: number,
    private readonly windowMs: number,
  ) {
    if (!Number.isFinite(max) || max <= 0) {
      throw new Error('INVALID_LIMIT_MAX');
    }
    if (!Number.isFinite(windowMs) || windowMs <= 0) {
      throw new Error('INVALID_LIMIT_WINDOW');
    }
  }

  async consume(key: string): Promise<RateLimitResult> {
    const redisKey = `${this.prefix}:${key}`;
    const raw = await this.redis.eval(CONSUME_WINDOW_SCRIPT, 1, redisKey, this.windowMs);

    if (!Array.isArray(raw) || raw.length < 2) {
      throw new Error('INVALID_RATE_LIMIT_RESPONSE');
    }

    const count = Number(raw[0]);
    const ttl = Math.max(0, Number(raw[1]));
    const resetAt = Date.now() + ttl;

    return {
      allowed: count <= this.max,
      limit: this.max,
      remaining: Math.max(0, this.max - count),
      resetAt,
    };
  }
}

export function enforceRateLimit(
  result: RateLimitResult,
  code = 'RATE_LIMITED',
  message = 'Request rate limit exceeded',
): void {
  if (!result.allowed) {
    throw new ApiError(429, code, message);
  }
}
