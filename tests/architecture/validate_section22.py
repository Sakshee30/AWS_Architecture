from pathlib import Path
R=Path(__file__).resolve().parents[2]
p=(R/"packages/observability/src/index.ts").read_text()
for x in ["tenantId","correlationId","traceId","durationMs","deploymentVersion","configurationVersion","latency_p50","latency_p95","latency_p99","db_connections","slow_queries","queue_depth","queue_age","consumer_lag","dlq_growth","cache_hit_ratio","worker_success","worker_failure","webhook_errors","ai_latency","ai_tokens","tenant_usage","[REDACTED]","TelemetryFanout"]:
 assert x in p,x
s=(R/"config/slos.yaml").read_text()
for x in ["owner:","severity:","dashboard:","escalation:","runbook:","database_failure","dependency_failure","security_events"]:
 assert x in s,x
m=(R/"infrastructure/terraform/modules/monitoring/main.tf").read_text()
for x in ["SLOBurnRate","QueueAgeSeconds","DLQGrowth","DatabaseFailure","DependencyFailure","SecurityEvent","alarm_actions"]:
 assert x in m,x
for f in ["docs/runbooks/api-slo.md","docs/runbooks/queue.md","docs/runbooks/database.md","docs/runbooks/dependency.md","docs/runbooks/security.md"]:
 assert (R/f).exists(),f
print("Section 22 observability validation passed")
