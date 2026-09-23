from pathlib import Path
R=Path(__file__).resolve().parents[2]
cfg=(R/'config/production-readiness.yaml').read_text()
script=(R/'scripts/production-readiness.py').read_text()
schema=R/'evidence/production-readiness.schema.json'
required=['authentication_mfa_authorization','tenant_isolation_all_boundaries','versioned_forward_compatible_migrations','optional_provider_fallbacks','outbox_inbox_idempotency','queue_retry_dlq_alert_replay','s3_quarantine_security','non_root_container_and_vulnerability_scan','reproducible_iac_and_drift_detection','approved_secret_stores_only','otel_logs_metrics_traces_redaction','slos_alerts_dashboards_runbooks','backup_restore_tests','load_security_chaos_tests','control_plane_approval_health_rollback','release_traceability']
for k in required:
 assert k in cfg and k in script,k
for token in ['fail_closed: true','code_presence_is_not_evidence: true','all_checks_required_for_ready: true']:
 assert token in cfg,token
assert schema.exists()
s=schema.read_text()
for k in required: assert k in s,k
for token in ['NOT READY','READINESS EVIDENCE COMPLETE','invalid JSON','missing evidence references']:
 assert token in script,token
print('Section 30 validation passed')
