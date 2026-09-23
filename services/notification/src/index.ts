import type { JobQueuePort } from '../../../packages/capability-contracts/src/index.js';
import { requirePermission, type TenantContext } from '../../../packages/security/src/index.js';

export type NotificationChannel = 'email' | 'webhook' | 'whatsapp';

export interface NotificationRequest {
  channel: NotificationChannel;
  destination: string;
  template: string;
  variables: Record<string, string>;
  correlationId: string;
  idempotencyKey: string;
}

export class NotificationService {
  constructor(private readonly queue: JobQueuePort) {}

  async queueDelivery(
    context: TenantContext,
    request: NotificationRequest,
  ): Promise<{ jobId: string }> {
    requirePermission(context, { permission: 'notification:send' });

    if (
      !request.destination.trim() ||
      !request.template.trim() ||
      !request.correlationId ||
      !request.idempotencyKey
    ) {
      throw new Error('INVALID_NOTIFICATION_REQUEST');
    }
    if (Object.keys(request.variables).length > 100) {
      throw new Error('NOTIFICATION_VARIABLE_LIMIT_EXCEEDED');
    }

    const jobId = await this.queue.enqueue(
      'notifications',
      {
        tenantId: context.tenantId,
        workspaceId: context.workspaceId,
        channel: request.channel,
        destination: request.destination,
        template: request.template,
        variables: structuredClone(request.variables),
      },
      {
        correlationId: request.correlationId,
        idempotencyKey: request.idempotencyKey,
        maxAttempts: 5,
      },
    );

    return { jobId };
  }
}
