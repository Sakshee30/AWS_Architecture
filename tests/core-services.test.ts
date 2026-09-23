import test from 'node:test';
import assert from 'node:assert/strict';
import { AuditService, type AuditRecord } from '../services/audit/src/index.js';
import { IdentityService } from '../services/identity/src/index.js';
import { IntegrationService } from '../services/integration/src/index.js';
import { NotificationService } from '../services/notification/src/index.js';
import { ReportingService } from '../services/reporting/src/index.js';
import { TenantService, type Workspace } from '../services/tenant/src/index.js';
import { WorkflowService, type WorkflowRun } from '../services/workflow/src/index.js';
import type { JobQueuePort } from '../packages/capability-contracts/src/index.js';
import type { TenantContext } from '../packages/security/src/index.js';

const context: TenantContext = {
  userId: 'user-1',
  tenantId: 'tenant-1',
  workspaceId: 'workspace-1',
  roles: ['admin'],
  permissions: [
    'workspace:create',
    'workflow:execute',
    'notification:send',
    'integration:write',
    'report:create',
    'report:read',
  ],
  mfa: true,
};

const healthy = async () => ({
  status: 'HEALTHY' as const,
  checkedAt: new Date().toISOString(),
});

function queue(): JobQueuePort & { items: unknown[] } {
  const items: unknown[] = [];
  return {
    items,
    health: healthy,
    enqueue: async (_name, payload) => {
      items.push(payload);
      return `job-${items.length}`;
    },
  };
}

test('audit service redacts secrets before append', async () => {
  const records: AuditRecord[] = [];
  const service = new AuditService({
    append: async (record) => {
      records.push(record);
    },
    list: async () => records,
  });

  await service.record(context, {
    action: 'integration.update',
    resource: 'connection:1',
    result: 'SUCCESS',
    correlationId: 'corr-1',
    details: {
      provider: 'crm',
      accessToken: 'must-not-be-stored',
      nested: { password: 'also-redacted' },
    },
  });

  assert.equal(records[0]?.details.accessToken, '[REDACTED]');
  assert.deepEqual(records[0]?.details.nested, { password: '[REDACTED]' });
});

test('identity profile cannot cross tenant boundary', async () => {
  const service = new IdentityService({
    findByUserId: async () => ({
      userId: 'user-1',
      tenantId: 'tenant-2',
      displayName: 'User',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
  });

  await assert.rejects(
    () => service.currentProfile(context),
    /IDENTITY_PROFILE_NOT_FOUND/,
  );
});

test('tenant service creates scoped workspace and rejects foreign workspace', async () => {
  const workspaces = new Map<string, Workspace>();
  const service = new TenantService({
    getTenant: async () => ({
      tenantId: 'tenant-1',
      name: 'Tenant',
      status: 'ACTIVE',
    }),
    getWorkspace: async (id) => workspaces.get(id),
    findWorkspaceBySlug: async (_tenantId, slug) =>
      [...workspaces.values()].find((workspace) => workspace.slug === slug),
    saveWorkspace: async (workspace) => {
      workspaces.set(workspace.workspaceId, workspace);
    },
  });

  const workspace = await service.createWorkspace(context, {
    name: 'Finance Team',
    slug: 'finance-team',
  });

  assert.equal(workspace.tenantId, 'tenant-1');

  workspaces.set('foreign', {
    ...workspace,
    workspaceId: 'foreign',
    tenantId: 'tenant-2',
  });

  await assert.rejects(
    () => service.getWorkspace(context, 'foreign'),
    /CROSS_TENANT_ACCESS_DENIED/,
  );
});

test('workflow, notification and reporting propagate tenant-scoped queue payloads', async () => {
  const jobs = queue();
  const runs: WorkflowRun[] = [];

  const workflow = new WorkflowService(
    {
      getDefinition: async () => ({
        workflowId: 'workflow-1',
        tenantId: 'tenant-1',
        workspaceId: 'workspace-1',
        name: 'Daily close',
        enabled: true,
        version: 3,
      }),
      saveRun: async (run) => {
        runs.push(run);
      },
    },
    jobs,
  );

  const run = await workflow.start(context, {
    workflowId: 'workflow-1',
    correlationId: 'corr-workflow',
    idempotencyKey: 'idem-workflow',
    payload: { period: 'today' },
  });

  assert.equal(run.tenantId, 'tenant-1');
  assert.equal(runs.length, 1);

  const notification = new NotificationService(jobs);
  await notification.queueDelivery(context, {
    channel: 'email',
    destination: 'ops@example.test',
    template: 'job-completed',
    variables: { id: '1' },
    correlationId: 'corr-notification',
    idempotencyKey: 'idem-notification',
  });

  const reports = new Map<string, Awaited<ReturnType<ReportingService['request']>>>();
  const reporting = new ReportingService(
    {
      save: async (job) => {
        reports.set(job.reportId, job);
      },
      get: async (_tenantId, reportId) => reports.get(reportId),
    },
    jobs,
  );

  const report = await reporting.request(context, {
    reportType: 'usage',
    format: 'csv',
    filters: { month: '2026-09' },
    correlationId: 'corr-report',
  });

  assert.equal(report.tenantId, 'tenant-1');
  assert.ok(jobs.items.length >= 3);
});

test('integration service stores secret reference but rejects secret material in config', async () => {
  const saved: unknown[] = [];
  const service = new IntegrationService({
    findByName: async () => undefined,
    save: async (connection) => {
      saved.push(connection);
    },
  });

  await assert.rejects(
    () =>
      service.createConnection(context, {
        provider: 'crm',
        displayName: 'Primary CRM',
        secretReference: 'secrets/integrations/crm',
        configuration: { apiToken: 'plaintext' },
      }),
    /PLAINTEXT_INTEGRATION_SECRET_FORBIDDEN/,
  );

  const connection = await service.createConnection(context, {
    provider: 'crm',
    displayName: 'Primary CRM',
    secretReference: 'secrets/integrations/crm',
    configuration: { region: 'in' },
  });

  assert.equal(connection.secretReference, 'secrets/integrations/crm');
  assert.equal(saved.length, 1);
});
