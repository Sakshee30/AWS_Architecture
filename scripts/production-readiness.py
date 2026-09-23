#!/usr/bin/env python3
from pathlib import Path
import json,sys

R=Path(__file__).resolve().parents[1]
evidence_path=R/"evidence/production-readiness.json"

required=[
 "authentication_mfa_authorization",
 "tenant_isolation_all_boundaries",
 "versioned_forward_compatible_migrations",
 "optional_provider_fallbacks",
 "outbox_inbox_idempotency",
 "queue_retry_dlq_alert_replay",
 "s3_quarantine_security",
 "non_root_container_and_vulnerability_scan",
 "reproducible_iac_and_drift_detection",
 "approved_secret_stores_only",
 "otel_logs_metrics_traces_redaction",
 "slos_alerts_dashboards_runbooks",
 "backup_restore_tests",
 "load_security_chaos_tests",
 "control_plane_approval_health_rollback",
 "release_traceability",
]

if not evidence_path.exists():
 print("NOT READY: production readiness evidence is absent. Code presence alone is insufficient.")
 sys.exit(2)

try:
 data=json.loads(evidence_path.read_text())
except Exception as exc:
 print(f"NOT READY: production readiness evidence is invalid JSON: {exc}")
 sys.exit(2)

missing=[]
invalid=[]
for key in required:
 item=data.get(key)
 if not isinstance(item,dict):
  missing.append(key);continue
 if item.get("passed") is not True:
  missing.append(key);continue
 evidence=item.get("evidence")
 if not isinstance(evidence,list) or not evidence or any(not isinstance(x,str) or not x.strip() for x in evidence):
  invalid.append(key)

if missing or invalid:
 if missing: print("NOT READY: failed/missing checks:",", ".join(missing))
 if invalid: print("NOT READY: passed checks missing evidence references:",", ".join(invalid))
 sys.exit(1)

print("READINESS EVIDENCE COMPLETE")
