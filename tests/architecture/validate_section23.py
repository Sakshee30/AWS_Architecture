from pathlib import Path
R=Path(__file__).resolve().parents[2]
for f in ["packages/platform-sdk/src/resilience.ts","config/dr.yaml","docs/runbooks/disaster-recovery.md","docs/reliability/failure-matrix.md"]: assert (R/f).exists(),f
s=(R/"packages/platform-sdk/src/resilience.ts").read_text()
for x in ["TransientDependencyError","PermanentDependencyError","TimeoutError","withTimeout","withRetry","Math.random","CircuitBreaker","Bulkhead","IdempotencyStore","DeadLetterQueue","readiness","GracefulShutdown","verifyOrRollback"]: assert x in s,x
m=(R/"docs/reliability/failure-matrix.md").read_text()
for x in ["Redis down","Kafka/MSK down","OpenSearch down","Worker down","Pod/task down","Availability Zone failure","AI provider down","S3 temporary issue","CRM/integration down","Email down"]: assert x in m,x
d=(R/"config/dr.yaml").read_text()
for x in ["rpo_minutes","rto_minutes","PITR","versioning/lifecycle","services:","secrets:","region:","Multi-AZ","evidence:"]: assert x in d,x
rb=(R/"docs/runbooks/disaster-recovery.md").read_text()
for x in ["RDS","PITR","immutable image digest","Queue/DLQ","S3","Secrets Manager","Region-failure","RPO/RTO"]: assert x in rb,x
print("Section 23 reliability and DR static validation passed")
