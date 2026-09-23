from pathlib import Path
R=Path(__file__).resolve().parents[2]
cfg=(R/'config/production-readiness.yaml').read_text()
script=(R/'scripts/production-readiness.py').read_text()
required=['authentication_mfa_authorization','tenant_isolation_all_boundaries','versioned_forward_compatible_migrations','optional_provider_fallbacks','outbox_inbox_idempotency','queue_retry_dlq_alert_replay','s3_quarantine_security','non_root_container_and_vulnerability_scan','reproducible_iac_and_drift_detection','approved_secret_stores_only','otel_logs_metrics_traces_redaction','slos_alerts_dashboards_runbooks','backup_restore_tests','load_security_chaos_tests','control_plane_approval_health_rollback','release_traceability']
for k in required:
 assert k in cfg and k in script,k
assert 'NOT READY' in script and 'READINESS EVIDENCE COMPLETE' in script
print('Section 30 validation passed')
