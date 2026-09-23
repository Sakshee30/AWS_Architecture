from pathlib import Path
import json,sys
R=Path(__file__).resolve().parents[1]; evidence=R/"evidence/production-readiness.json"
required=["authentication_mfa_authorization","tenant_isolation_all_boundaries","versioned_forward_compatible_migrations","optional_provider_fallbacks","outbox_inbox_idempotency","queue_retry_dlq_alert_replay","s3_quarantine_security","non_root_container_and_vulnerability_scan","reproducible_iac_and_drift_detection","approved_secret_stores_only","otel_logs_metrics_traces_redaction","slos_alerts_dashboards_runbooks","backup_restore_tests","load_security_chaos_tests","control_plane_approval_health_rollback","release_traceability"]
if not evidence.exists(): print("NOT READY: production readiness evidence is absent. Code presence alone is insufficient.");sys.exit(2)
data=json.loads(evidence.read_text());missing=[x for x in required if not data.get(x,{}).get("passed") or not data.get(x,{}).get("evidence")]
if missing: print("NOT READY:",", ".join(missing));sys.exit(1)
print("READINESS EVIDENCE COMPLETE")
