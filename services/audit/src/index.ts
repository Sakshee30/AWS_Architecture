import { randomUUID } from 'node:crypto';
import type { TenantContext } from '../../../packages/security/src/index.js';

export interface AuditRecord {
  id: string;
  tenantId: string;
  workspaceId?: string;
  actorId: string;
  action: string;
  resource: string;
  result: 'SUCCESS' | 'DENIED' | 'FAILED';
  correlationId: string;
  occurredAt: string;
  details: Record<string, unknown>;
}

export interface AuditRepository {
  append(record: AuditRecord): Promise<void>;
  list(input: {
    tenantId: string;
    workspaceId?: string;
    limit: number;
  }): Promise<AuditRecord[]>;
}

const sensitiveKey = /password|authorization|cookie|token|api.?key|secret|credential/i;

function redact(value: unknown, key = ''): unknown {
  if (sensitiveKey.test(key)) return '[REDACTED]';
  if (Array.isArray(value)) return value.map((entry) => redact(entry));
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([nestedKey, nestedValue]) => [
        nestedKey,
        redact(nestedValue, nestedKey),
      ]),
    );
  }
  return value;
}

export class AuditService {
  constructor(private readonly repository: AuditRepository) {}

  async record(
    context: Pick<TenantContext, 'tenantId' | 'workspaceId' | 'userId'>,
    input: {
      action: string;
      resource: string;
      result: AuditRecord['result'];
      correlationId: string;
      details?: Record<string, unknown>;
    },
  ): Promise<AuditRecord> {
    if (!input.action || !input.resource || !input.correlationId) {
      throw new Error('AUDIT_CONTEXT_REQUIRED');
    }

    const record: AuditRecord = {
      id: randomUUID(),
      tenantId: context.tenantId,
      workspaceId: context.workspaceId,
      actorId: context.userId,
      action: input.action,
      resource: input.resource,
      result: input.result,
      correlationId: input.correlationId,
      occurredAt: new Date().toISOString(),
      details: redact(input.details ?? {}) as Record<string, unknown>,
    };

    await this.repository.append(record);
    return record;
  }

  list(
    context: Pick<TenantContext, 'tenantId' | 'workspaceId'>,
    limit = 100,
  ): Promise<AuditRecord[]> {
    return this.repository.list({
      tenantId: context.tenantId,
      workspaceId: context.workspaceId,
      limit: Math.max(1, Math.min(500, limit)),
    });
  }
}
