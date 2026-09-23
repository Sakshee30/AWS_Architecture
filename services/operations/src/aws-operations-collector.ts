import {
  BackupClient,
  ListBackupJobsCommand,
} from '@aws-sdk/client-backup';
import {
  CloudTrailClient,
  LookupEventsCommand,
} from '@aws-sdk/client-cloudtrail';
import {
  CloudWatchClient,
  GetMetricDataCommand,
  type MetricDataResult,
} from '@aws-sdk/client-cloudwatch';
import {
  CostExplorerClient,
  GetCostAndUsageCommand,
} from '@aws-sdk/client-cost-explorer';
import {
  GuardDutyClient,
  ListDetectorsCommand,
  ListFindingsCommand as ListGuardDutyFindingsCommand,
} from '@aws-sdk/client-guardduty';
import {
  Inspector2Client,
  ListFindingsCommand as ListInspectorFindingsCommand,
} from '@aws-sdk/client-inspector2';
import {
  SecurityHubClient,
  GetFindingsCommand as GetSecurityHubFindingsCommand,
} from '@aws-sdk/client-securityhub';
import type { OperationsSnapshot, SourceSummary } from './types.js';

interface CollectorOptions {
  region: string;
  metricNamespace?: string;
}

function errorCode(error: unknown): string {
  if (error && typeof error === 'object' && 'name' in error) {
    return String((error as { name?: unknown }).name ?? 'AWS_OPERATION_FAILED');
  }

  return 'AWS_OPERATION_FAILED';
}

async function safe<T>(
  collect: () => Promise<T>,
): Promise<{ ok: true; value: T } | { ok: false; code: string }> {
  try {
    return { ok: true, value: await collect() };
  } catch (error) {
    return { ok: false, code: errorCode(error) };
  }
}

function latestValue(result: MetricDataResult | undefined): number | null {
  const values = result?.Values ?? [];
  return values.length > 0 ? Number(values[0]) : null;
}

function tomorrowUtc(): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

function monthStartUtc(): string {
  const date = new Date();
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1))
    .toISOString()
    .slice(0, 10);
}

export class AwsOperationsCollector {
  private readonly cloudWatch: CloudWatchClient;
  private readonly guardDuty: GuardDutyClient;
  private readonly securityHub: SecurityHubClient;
  private readonly inspector: Inspector2Client;
  private readonly cloudTrail: CloudTrailClient;
  private readonly costExplorer: CostExplorerClient;
  private readonly backup: BackupClient;
  private readonly metricNamespace: string;

  constructor(private readonly options: CollectorOptions) {
    this.metricNamespace = options.metricNamespace ?? 'Platform';
    this.cloudWatch = new CloudWatchClient({ region: options.region });
    this.guardDuty = new GuardDutyClient({ region: options.region });
    this.securityHub = new SecurityHubClient({ region: options.region });
    this.inspector = new Inspector2Client({ region: options.region });
    this.cloudTrail = new CloudTrailClient({ region: options.region });
    this.costExplorer = new CostExplorerClient({ region: 'us-east-1' });
    this.backup = new BackupClient({ region: options.region });
  }

  async collect(): Promise<OperationsSnapshot> {
    const [
      observability,
      guardDuty,
      securityHub,
      inspector,
      cloudTrail,
      costs,
      backup,
    ] = await Promise.all([
      this.collectCloudWatch(),
      this.collectGuardDuty(),
      this.collectSecurityHub(),
      this.collectInspector(),
      this.collectCloudTrail(),
      this.collectCosts(),
      this.collectBackup(),
    ]);

    const sourceStates = [guardDuty.state, securityHub.state, inspector.state];
    const securityState = sourceStates.includes('UNAVAILABLE')
      ? 'DEGRADED'
      : 'HEALTHY';

    return {
      collectedAt: new Date().toISOString(),
      observability,
      security: {
        posture: securityState,
        guardDuty,
        securityHub,
        inspector,
        cloudTrail,
        criticalFindings:
          (guardDuty.critical ?? 0) +
          (securityHub.critical ?? 0) +
          (inspector.critical ?? 0),
        highFindings:
          (guardDuty.high ?? 0) +
          (securityHub.high ?? 0) +
          (inspector.high ?? 0),
      },
      costs,
      backupDr: backup,
    };
  }

  private async collectCloudWatch(): Promise<Record<string, unknown>> {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - 5 * 60_000);

    const result = await safe(async () =>
      this.cloudWatch.send(
        new GetMetricDataCommand({
          StartTime: startTime,
          EndTime: endTime,
          ScanBy: 'TimestampDescending',
          MetricDataQueries: [
            this.metricQuery('traffic', 'Traffic', 'Sum'),
            this.metricQuery('latencyP95', 'LatencyP95', 'Average'),
            this.metricQuery('latencyP99', 'LatencyP99', 'Average'),
            this.metricQuery('errorRate', 'ErrorRate', 'Average'),
            this.metricQuery('saturation', 'Saturation', 'Average'),
            this.metricQuery('securityEvents', 'SecurityEvent', 'Sum'),
          ],
        }),
      ),
    );

    if (!result.ok) {
      return {
        state: 'UNAVAILABLE',
        source: 'cloudwatch',
        errorCode: result.code,
      };
    }

    const byId = new Map(
      (result.value.MetricDataResults ?? []).map((item) => [item.Id, item]),
    );

    return {
      state: 'HEALTHY',
      source: 'cloudwatch',
      windowMinutes: 5,
      traffic: {
        requests: latestValue(byId.get('traffic')),
      },
      latency: {
        p95Ms: latestValue(byId.get('latencyP95')),
        p99Ms: latestValue(byId.get('latencyP99')),
      },
      errors: {
        rate: latestValue(byId.get('errorRate')),
      },
      saturation: {
        value: latestValue(byId.get('saturation')),
      },
      securityEvents: latestValue(byId.get('securityEvents')),
    };
  }

  private metricQuery(
    id: string,
    metricName: string,
    stat: 'Sum' | 'Average',
  ) {
    return {
      Id: id,
      ReturnData: true,
      MetricStat: {
        Metric: {
          Namespace: this.metricNamespace,
          MetricName: metricName,
        },
        Period: 60,
        Stat: stat,
      },
    };
  }

  private async collectGuardDuty(): Promise<SourceSummary> {
    const detectors = await safe(() =>
      this.guardDuty.send(new ListDetectorsCommand({ MaxResults: 10 })),
    );

    if (!detectors.ok) {
      return { state: 'UNAVAILABLE', details: { errorCode: detectors.code } };
    }

    const detectorId = detectors.value.DetectorIds?.[0];
    if (!detectorId) {
      return { state: 'NOT_CONFIGURED', count: 0 };
    }

    const findings = await safe(() =>
      this.guardDuty.send(
        new ListGuardDutyFindingsCommand({
          DetectorId: detectorId,
          MaxResults: 50,
        }),
      ),
    );

    if (!findings.ok) {
      return { state: 'UNAVAILABLE', details: { errorCode: findings.code } };
    }

    return {
      state: 'HEALTHY',
      count: findings.value.FindingIds?.length ?? 0,
      details: {
        truncated: Boolean(findings.value.NextToken),
      },
    };
  }

  private async collectSecurityHub(): Promise<SourceSummary> {
    const result = await safe(() =>
      this.securityHub.send(
        new GetSecurityHubFindingsCommand({
          MaxResults: 100,
        }),
      ),
    );

    if (!result.ok) {
      return { state: 'UNAVAILABLE', details: { errorCode: result.code } };
    }

    const findings = result.value.Findings ?? [];
    const counts = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };

    for (const finding of findings) {
      const label = finding.Severity?.Label;
      if (label === 'CRITICAL') counts.critical += 1;
      else if (label === 'HIGH') counts.high += 1;
      else if (label === 'MEDIUM') counts.medium += 1;
      else if (label === 'LOW') counts.low += 1;
    }

    return {
      state: 'HEALTHY',
      count: findings.length,
      ...counts,
      details: {
        truncated: Boolean(result.value.NextToken),
      },
    };
  }

  private async collectInspector(): Promise<SourceSummary> {
    const result = await safe(() =>
      this.inspector.send(
        new ListInspectorFindingsCommand({
          maxResults: 100,
        }),
      ),
    );

    if (!result.ok) {
      return { state: 'UNAVAILABLE', details: { errorCode: result.code } };
    }

    const findings = result.value.findings ?? [];
    const counts = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };

    for (const finding of findings) {
      if (finding.severity === 'CRITICAL') counts.critical += 1;
      else if (finding.severity === 'HIGH') counts.high += 1;
      else if (finding.severity === 'MEDIUM') counts.medium += 1;
      else if (finding.severity === 'LOW') counts.low += 1;
    }

    return {
      state: 'HEALTHY',
      count: findings.length,
      ...counts,
      details: {
        truncated: Boolean(result.value.nextToken),
      },
    };
  }

  private async collectCloudTrail(): Promise<SourceSummary> {
    const result = await safe(() =>
      this.cloudTrail.send(
        new LookupEventsCommand({
          MaxResults: 20,
        }),
      ),
    );

    if (!result.ok) {
      return { state: 'UNAVAILABLE', details: { errorCode: result.code } };
    }

    const events = (result.value.Events ?? []).map((event) => ({
      eventName: event.EventName ?? 'unknown',
      eventTime: event.EventTime?.toISOString() ?? null,
      username: event.Username ?? null,
    }));

    return {
      state: 'HEALTHY',
      count: events.length,
      details: { events },
    };
  }

  private async collectCosts(): Promise<Record<string, unknown>> {
    const result = await safe(() =>
      this.costExplorer.send(
        new GetCostAndUsageCommand({
          TimePeriod: {
            Start: monthStartUtc(),
            End: tomorrowUtc(),
          },
          Granularity: 'MONTHLY',
          Metrics: ['UnblendedCost'],
          GroupBy: [{ Type: 'DIMENSION', Key: 'SERVICE' }],
        }),
      ),
    );

    if (!result.ok) {
      return {
        state: 'UNAVAILABLE',
        currency: 'USD',
        errorCode: result.code,
      };
    }

    const period = result.value.ResultsByTime?.[0];
    const services = (period?.Groups ?? [])
      .map((group) => ({
        service: group.Keys?.[0] ?? 'unknown',
        amount: Number(group.Metrics?.UnblendedCost?.Amount ?? 0),
        unit: group.Metrics?.UnblendedCost?.Unit ?? 'USD',
      }))
      .sort((left, right) => right.amount - left.amount);

    return {
      state: 'HEALTHY',
      currency: 'USD',
      period: {
        start: monthStartUtc(),
        through: todayUtc(),
      },
      monthToDate: services.reduce((sum, item) => sum + item.amount, 0),
      services: services.slice(0, 20),
      estimated: Boolean(period?.Estimated),
    };
  }

  private async collectBackup(): Promise<Record<string, unknown>> {
    const result = await safe(() =>
      this.backup.send(
        new ListBackupJobsCommand({
          MaxResults: 20,
        }),
      ),
    );

    if (!result.ok) {
      return {
        state: 'UNAVAILABLE',
        errorCode: result.code,
        backups: [],
      };
    }

    const jobs = result.value.BackupJobs ?? [];
    const failed = jobs.filter(
      (job) => job.State === 'FAILED' || job.State === 'ABORTED',
    );

    return {
      state: failed.length > 0 ? 'DEGRADED' : 'HEALTHY',
      backups: jobs.map((job) => ({
        jobId: job.BackupJobId ?? null,
        state: job.State ?? 'UNKNOWN',
        resourceType: job.ResourceType ?? null,
        creationDate: job.CreationDate?.toISOString() ?? null,
        completionDate: job.CompletionDate?.toISOString() ?? null,
      })),
      failedJobs: failed.length,
    };
  }
}
