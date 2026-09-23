import { randomUUID } from 'node:crypto';
import { requirePermission, type TenantContext } from '../../../packages/security/src/index.js';

export interface IntegrationConnection {
  connectionId: string;
  tenantId: string;
  workspaceId?: string;
  provider: string;
  displayName: string;
  secretReference: string;
  configuration: Record<string, string | number | boolean>;
  status: 'ACTIVE' | 'DISABLED';
  createdAt: string;
}

export interface IntegrationRepository {
  findByName(
    tenantId: string,
    workspaceId: string | undefined,
    provider: string,
    displayName: string,
  ): Promise<IntegrationConnection | undefined>;
  save(connection: IntegrationConnection): Promise<void>;
}

const sensitiveConfigKey = /password|token|secret|credential|api.?key/i;

export class IntegrationService {
  constructor(private readonly repository: IntegrationRepository) {}

  async createConnection(
    context: TenantContext,
    input: {
      provider: string;
      displayName: string;
      secretReference: string;
      configuration?: Record<string, string | number | boolean>;
    },
  ): Promise<IntegrationConnection> {
    requirePermission(context, { permission: 'integration:write' });

    const provider = input.provider.trim().toLowerCase();
    const displayName = input.displayName.trim();
    if (!provider || !displayName || !input.secretReference.trim()) {
      throw new Error('INVALID_INTEGRATION_CONNECTION');
    }

    const configuration = input.configuration ?? {};
    for (const key of Object.keys(configuration)) {
      if (sensitiveConfigKey.test(key)) {
        throw new Error('PLAINTEXT_INTEGRATION_SECRET_FORBIDDEN');
      }
    }

    const existing = await this.repository.findByName(
      context.tenantId,
      context.workspaceId,
      provider,
      displayName,
    );
    if (existing) throw new Error('INTEGRATION_CONNECTION_ALREADY_EXISTS');

    const connection: IntegrationConnection = {
      connectionId: randomUUID(),
      tenantId: context.tenantId,
      workspaceId: context.workspaceId,
      provider,
      displayName,
      secretReference: input.secretReference,
      configuration: structuredClone(configuration),
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };

    await this.repository.save(connection);
    return connection;
  }
}
