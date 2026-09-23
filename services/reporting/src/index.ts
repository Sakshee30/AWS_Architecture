import { randomUUID } from 'node:crypto';
import type { JobQueuePort } from '../../../packages/capability-contracts/src/index.js';
import { requirePermission, type TenantContext } from '../../../packages/security/src/index.js';

export interface ReportRequest {
  reportType: string;
  format: 'csv' | 'json' | 'pdf';
  filters: Record<string, string | number | boolean>;
  correlationId: string;
}

export interface ReportJob {
  reportId: string;
  tenantId: string;
  workspaceId?: string;
  reportType: string;
  format: ReportRequest['format'];
  state: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
}

export interface ReportingRepository {
  save(job: ReportJob): Promise<void>;
  get(tenantId: string, reportId: string): Promise<ReportJob | undefined>;
}

export class ReportingService {
  constructor(
    private readonly repository: ReportingRepository,
    private readonly queue: JobQueuePort,
  ) {}

  async request(context: TenantContext, input: ReportRequest): Promise<ReportJob> {
    requirePermission(context, { permission: 'report:create' });
    if (!input.reportType.trim() || !input.correlationId) {
      throw new Error('INVALID_REPORT_REQUEST');
    }
    if (Object.keys(input.filters).length > 50) {
      throw new Error('REPORT_FILTER_LIMIT_EXCEEDED');
    }

    const job: ReportJob = {
      reportId: randomUUID(),
      tenantId: context.tenantId,
      workspaceId: context.workspaceId,
      reportType: input.reportType,
      format: input.format,
      state: 'QUEUED',
      createdAt: new Date().toISOString(),
    };

    await this.repository.save(job);
    await this.queue.enqueue(
      'report-generation',
      { ...job, filters: structuredClone(input.filters) },
      {
        idempotencyKey: `report:${context.tenantId}:${job.reportId}`,
        correlationId: input.correlationId,
        maxAttempts: 3,
      },
    );

    return job;
  }

  async get(context: TenantContext, reportId: string): Promise<ReportJob> {
    requirePermission(context, { permission: 'report:read' });

    const report = await this.repository.get(context.tenantId, reportId);
    if (!report) throw new Error('REPORT_NOT_FOUND');

    if (
      context.workspaceId &&
      report.workspaceId &&
      context.workspaceId !== report.workspaceId
    ) {
      throw new Error('CROSS_WORKSPACE_ACCESS_DENIED');
    }

    return structuredClone(report);
  }
}
