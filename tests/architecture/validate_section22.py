from pathlib import Path
R=Path(__file__).resolve().parents[2]; p=(R/"packages/observability/src/index.ts").read_text()
for x in ["tenantId","correlationId","traceId","durationMs","latency_p50","dlq_growth","ai_tokens","[REDACTED]"]: assert x in p,x
for f in ["config/slos.yaml","docs/runbooks/api-slo.md","docs/runbooks/queue.md"]: assert (R/f).exists(),f
print("Section 22 static validation passed")
