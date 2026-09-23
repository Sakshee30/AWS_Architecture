import type { ChangeRequest } from './change-machine.js';

export type ControlPage =
  | 'overview'
  | 'capabilities'
  | 'features'
  | 'providers'
  | 'environments'
  | 'dependencies'
  | 'infrastructure'
  | 'deployments'
  | 'health'
  | 'observability'
  | 'security'
  | 'secrets'
  | 'costs'
  | 'backup-dr'
  | 'drift'
  | 'emergency';

export interface ControlSnapshot {
  updatedAt: string;
  data: Record<string, unknown>;
}

export interface ControlStore {
  getDesiredState(): Promise<Record<string, unknown>>;
  getActualState(): Promise<Record<string, unknown>>;
  getConfigVersion(): Promise<number>;
  setDesiredState(value: Record<string, unknown>, actorId: string): Promise<void>;
  setActualState(value: Record<string, unknown>, actorId?: string): Promise<void>;
  setPage(page: ControlPage, data: Record<string, unknown>, actorId?: string): Promise<void>;
  getPage(page: ControlPage): Promise<ControlSnapshot>;
  saveChange(change: ChangeRequest): Promise<void>;
  getChange(id: string): Promise<ChangeRequest | undefined>;
  listChanges(): Promise<ChangeRequest[]>;
  auditHistory(): Promise<Array<Record<string, unknown>>>;
  recordAudit(entry: Record<string, unknown>): Promise<void>;
}

export interface SqlExecutor {
  query<T = unknown>(sql: string, params?: unknown[]): Promise<{ rows: T[] }>;
}

function initialPage(page: ControlPage): Record<string, unknown> {
  switch (page) {
    case 'overview':
      return {
        health: 'UNKNOWN',
        profile: 'unknown',
        drift: 'UNKNOWN',
        criticalAlerts: [],
        traffic: { currentRps: null, peakRps: null },
        latency: { p50Ms: null, p95Ms: null, p99Ms: null },
        errors: { rate: null, fourXx: null, fiveXx: null },
      };
    case 'capabilities':
    case 'features':
    case 'providers':
      return { items: [] };
    case 'environments':
      return { items: ['development', 'testing', 'staging', 'production'] };
    case 'dependencies':
      return { graph: {}, conflicts: [] };
    case 'infrastructure':
      return { resources: [], compute: {}, database: {}, cache: {}, queues: {} };
    case 'deployments':
      return { releases: [], activeVersion: null };
    case 'health':
      return { dependencies: [], workers: [], queues: [], dlq: [], integrations: [] };
    case 'observability':
      return {
        metrics: true,
        tracing: true,
        logging: true,
        slos: [],
        traffic: {},
        latency: {},
        errors: {},
        saturation: {},
      };
    case 'security':
      return {
        posture: 'UNKNOWN',
        criticalFindings: [],
        findings: [],
        waf: {},
        guardDuty: {},
        securityHub: {},
        inspector: {},
        authentication: {},
        authorization: {},
        tenantIsolation: {},
      };
    case 'secrets':
      return {
        items: [],
        note: 'Secret metadata only; plaintext values are never stored or returned by the control plane.',
      };
    case 'costs':
      return { currency: 'USD', items: [], today: null, forecast: null };
    case 'backup-dr':
      return { rpo: null, rto: null, backups: [], restoreTests: [] };
    case 'drift':
      return { status: 'UNKNOWN', items: [] };
    case 'emergency':
      return { maintenanceMode: false, killSwitches: {} };
  }
}

const ALL_PAGES: ControlPage[] = [
  'overview',
  'capabilities',
  'features',
  'providers',
  'environments',
  'dependencies',
  'infrastructure',
  'deployments',
  'health',
  'observability',
  'security',
  'secrets',
  'costs',
  'backup-dr',
  'drift',
  'emergency',
];

export class InMemoryControlStore implements ControlStore {
  private desiredState: Record<string, unknown> = {};
  private actualState: Record<string, unknown> = {};
  private readonly changes = new Map<string, ChangeRequest>();
  private readonly audit: Array<Record<string, unknown>> = [];
  private readonly pages = new Map<ControlPage, ControlSnapshot>();
  private configVersion = 1;

  constructor() {
    const updatedAt = new Date().toISOString();
    for (const page of ALL_PAGES) {
      this.pages.set(page, { updatedAt, data: initialPage(page) });
    }
  }

  async getDesiredState(): Promise<Record<string, unknown>> {
    return structuredClone(this.desiredState);
  }

  async getActualState(): Promise<Record<string, unknown>> {
    return structuredClone(this.actualState);
  }

  async getConfigVersion(): Promise<number> {
    return this.configVersion;
  }

  async setDesiredState(value: Record<string, unknown>, actorId: string): Promise<void> {
    this.desiredState = structuredClone(value);
    this.configVersion += 1;
    await this.recordAudit({
      type: 'desired-state.updated',
      actorId,
      configVersion: this.configVersion,
    });
  }

  async setActualState(value: Record<string, unknown>, actorId = 'system'): Promise<void> {
    this.actualState = structuredClone(value);
    await this.recordAudit({ type: 'actual-state.observed', actorId });
  }

  async setPage(
    page: ControlPage,
    data: Record<string, unknown>,
    actorId = 'system',
  ): Promise<void> {
    this.pages.set(page, {
      updatedAt: new Date().toISOString(),
      data: structuredClone(data),
    });
    await this.recordAudit({ type: `control-page.${page}.updated`, actorId });
  }

  async getPage(page: ControlPage): Promise<ControlSnapshot> {
    return structuredClone(
      this.pages.get(page) ?? {
        updatedAt: new Date(0).toISOString(),
        data: initialPage(page),
      },
    );
  }

  async saveChange(change: ChangeRequest): Promise<void> {
    this.changes.set(change.id, structuredClone(change));
    await this.recordAudit({
      type: 'change.saved',
      changeId: change.id,
      actorId: change.actorId,
      state: change.state,
    });
  }

  async getChange(id: string): Promise<ChangeRequest | undefined> {
    const value = this.changes.get(id);
    return value ? structuredClone(value) : undefined;
  }

  async listChanges(): Promise<ChangeRequest[]> {
    return [...this.changes.values()]
      .map((value) => structuredClone(value))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async auditHistory(): Promise<Array<Record<string, unknown>>> {
    return structuredClone(this.audit);
  }

  async recordAudit(entry: Record<string, unknown>): Promise<void> {
    this.audit.push({
      ...structuredClone(entry),
      at: new Date().toISOString(),
    });
  }
}

interface RuntimeStateRow {
  config_version: string | number;
  desired_state: Record<string, unknown>;
  actual_state: Record<string, unknown>;
}

interface PageRow {
  data: Record<string, unknown>;
  updated_at: string | Date;
}

interface ChangeRow {
  payload: ChangeRequest;
}

interface AuditRow {
  payload: Record<string, unknown>;
  created_at: string | Date;
}

export class PostgresControlStore implements ControlStore {
  constructor(
    private readonly db: SqlExecutor,
    private readonly environment: string,
  ) {}

  async getDesiredState(): Promise<Record<string, unknown>> {
    const state = await this.runtimeState();
    return structuredClone(state?.desired_state ?? {});
  }

  async getActualState(): Promise<Record<string, unknown>> {
    const state = await this.runtimeState();
    return structuredClone(state?.actual_state ?? {});
  }

  async getConfigVersion(): Promise<number> {
    const state = await this.runtimeState();
    return Number(state?.config_version ?? 1);
  }

  async setDesiredState(value: Record<string, unknown>, actorId: string): Promise<void> {
    const result = await this.db.query<{ config_version: string | number }>(
      `INSERT INTO control_runtime_state(
         environment, config_version, desired_state, actual_state, updated_at
       )
       VALUES($1, 2, $2, '{}'::jsonb, now())
       ON CONFLICT(environment) DO UPDATE
       SET desired_state = EXCLUDED.desired_state,
           config_version = control_runtime_state.config_version + 1,
           updated_at = now()
       RETURNING config_version`,
      [this.environment, value],
    );

    await this.recordAudit({
      type: 'desired-state.updated',
      actorId,
      configVersion: Number(result.rows[0]?.config_version ?? 1),
    });
  }

  async setActualState(value: Record<string, unknown>, actorId = 'system'): Promise<void> {
    await this.db.query(
      `INSERT INTO control_runtime_state(
         environment, config_version, desired_state, actual_state, updated_at
       )
       VALUES($1, 1, '{}'::jsonb, $2, now())
       ON CONFLICT(environment) DO UPDATE
       SET actual_state = EXCLUDED.actual_state,
           updated_at = now()`,
      [this.environment, value],
    );

    await this.recordAudit({ type: 'actual-state.observed', actorId });
  }

  async setPage(
    page: ControlPage,
    data: Record<string, unknown>,
    actorId = 'system',
  ): Promise<void> {
    await this.db.query(
      `INSERT INTO control_page_runtime(environment, page, data, updated_at)
       VALUES($1, $2, $3, now())
       ON CONFLICT(environment, page) DO UPDATE
       SET data = EXCLUDED.data,
           updated_at = now()`,
      [this.environment, page, data],
    );

    await this.recordAudit({ type: `control-page.${page}.updated`, actorId });
  }

  async getPage(page: ControlPage): Promise<ControlSnapshot> {
    const result = await this.db.query<PageRow>(
      `SELECT data, updated_at
       FROM control_page_runtime
       WHERE environment = $1 AND page = $2`,
      [this.environment, page],
    );

    const row = result.rows[0];
    if (!row) {
      return {
        updatedAt: new Date(0).toISOString(),
        data: initialPage(page),
      };
    }

    return {
      updatedAt: new Date(row.updated_at).toISOString(),
      data: structuredClone(row.data),
    };
  }

  async saveChange(change: ChangeRequest): Promise<void> {
    await this.db.query(
      `INSERT INTO control_change_request_runtime(
         environment, change_id, payload, created_at, updated_at
       )
       VALUES($1, $2, $3, $4, now())
       ON CONFLICT(environment, change_id) DO UPDATE
       SET payload = EXCLUDED.payload,
           updated_at = now()`,
      [this.environment, change.id, change, change.createdAt],
    );

    await this.recordAudit({
      type: 'change.saved',
      changeId: change.id,
      actorId: change.actorId,
      state: change.state,
    });
  }

  async getChange(id: string): Promise<ChangeRequest | undefined> {
    const result = await this.db.query<ChangeRow>(
      `SELECT payload
       FROM control_change_request_runtime
       WHERE environment = $1 AND change_id = $2`,
      [this.environment, id],
    );

    return result.rows[0]?.payload
      ? structuredClone(result.rows[0].payload)
      : undefined;
  }

  async listChanges(): Promise<ChangeRequest[]> {
    const result = await this.db.query<ChangeRow>(
      `SELECT payload
       FROM control_change_request_runtime
       WHERE environment = $1
       ORDER BY updated_at DESC
       LIMIT 500`,
      [this.environment],
    );

    return result.rows.map((row) => structuredClone(row.payload));
  }

  async auditHistory(): Promise<Array<Record<string, unknown>>> {
    const result = await this.db.query<AuditRow>(
      `SELECT payload, created_at
       FROM control_audit_runtime
       WHERE environment = $1
       ORDER BY created_at DESC
       LIMIT 1000`,
      [this.environment],
    );

    return result.rows.map((row) => ({
      ...structuredClone(row.payload),
      at: new Date(row.created_at).toISOString(),
    }));
  }

  async recordAudit(entry: Record<string, unknown>): Promise<void> {
    await this.db.query(
      `INSERT INTO control_audit_runtime(environment, payload, created_at)
       VALUES($1, $2, now())`,
      [this.environment, entry],
    );
  }

  private async runtimeState(): Promise<RuntimeStateRow | undefined> {
    const result = await this.db.query<RuntimeStateRow>(
      `SELECT config_version, desired_state, actual_state
       FROM control_runtime_state
       WHERE environment = $1`,
      [this.environment],
    );

    return result.rows[0];
  }
}
