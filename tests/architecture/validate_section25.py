from pathlib import Path
R=Path(__file__).resolve().parents[2]
s=(R/"packages/security/src/control-governance.ts").read_text()
for x in ["Viewer","Developer","Operator","DevOps","Security Admin","Approver","Platform Admin","tenant","workspace","service","feature","assertProductionApproval","SEPARATION_OF_DUTIES","GovernanceAuditRecord","applyEmergencyControl","MAINTENANCE_SCOPE_REQUIRED"]:
 assert x in s,x
cfg=(R/"config/emergency-controls.yaml").read_text()
for x in ["disable_signups","disable_file_uploads","disable_ai","disable_external_webhook_processing","disable_outbound_integrations","read_only","maintenance_mode","platform","tenant","workspace","service","feature","requestor_must_not_equal_approver","audit_required"]:
 assert x in cfg,x
m=(R/"apps/platform-control-api/migrations/025_governance_audit.sql").read_text()
for x in ["reason","ticket_reference","source_session","approval_session","execution_result","rollback_change_id","idx_platform_change_environment_requested_at","idx_audit_event_environment_timestamp"]:
 assert x in m,x
print("Section 25 governance validation passed")
