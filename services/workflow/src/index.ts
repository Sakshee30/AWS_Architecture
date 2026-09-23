import { randomUUID } from 'node:crypto';
import type { JobQueuePort } from '../../../packages/capability-contracts/src/index.js';
import { requirePermission, type TenantContext } from '../../../packages/security/src/index.js';

export interface WorkflowDefinition {
  workflowId: string;
  tenantId: string;
  workspaceId?: string;
  name: string;
  enabled: boolean;
  version: number;
}

export interface WorkflowRun {
  runId: string;
  workflowId: string;
  tenantId: string;
  workspaceId?: string;
  state: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  correlationId: string;
  createdAt: string;
}

export interface WorkflowRepository {
  getDefinition(tenantId: string, workflowId: string): Promise<WorkflowDefinition | undefined>;
  saveRun(run: WorkflowRun): Promise<void>;
}

export class WorkflowService {
  constructor(
    private readonly repository: WorkflowRepository,
    private readonly queue: JobQueuePort,
  ) {}

  async start(
    context: TenantContext,
    input: {
      workflowId: string;
      correlationId: string;
      payload: Record<string, unknown>;
      idempotencyKey: string;
    },
  ): Promise<WorkflowRun> {
    requirePermission(context, { permission: 'workflow:execute' });

    const definition = await this.repository.getDefinition(context.tenantId, input.workflowId);
    if (!definition || !definition.enabled) throw new Error('WORKFLOW_UNAVAILABLE');

    if (
      context.workspaceId &&
      definition.workspaceId &&
      definition.workspaceId !== context.workspaceId
    ) {
      throw new Error('CROSS_WORKSPACE_ACCESS_DENIED');
    }

    const run: WorkflowRun = {
      runId: randomUUID(),
      workflowId: definition.workflowId,
      tenantId: context.tenantId,
      workspaceId: context.workspaceId,
      state: 'QUEUED',
      correlationId: input.correlationId,
      createdAt: new Date().toISOString(),
    };

    await this.repository.saveRun(run);
    await this.queue.enqueue(
      'workflow-runs',
      {
        runId: run.runId,
        workflowId: run.workflowId,
        workflowVersion: definition.version,
        tenantId: run.tenantId,
        workspaceId: run.workspaceId,
        payload: structuredClone(input.payload),
      },
      {
        idempotencyKey: input.idempotencyKey,
        correlationId: input.correlationId,
        maxAttempts: 5,
      },
    );

    return run;
  }
}
