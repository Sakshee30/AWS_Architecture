export type SourceState = 'HEALTHY' | 'DEGRADED' | 'UNAVAILABLE' | 'NOT_CONFIGURED';

export interface SourceSummary {
  state: SourceState;
  count?: number;
  critical?: number;
  high?: number;
  medium?: number;
  low?: number;
  details?: Record<string, unknown>;
}

export interface OperationsSnapshot {
  collectedAt: string;
  observability: Record<string, unknown>;
  security: Record<string, unknown>;
  costs: Record<string, unknown>;
  backupDr: Record<string, unknown>;
}
