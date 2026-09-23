from pathlib import Path
R=Path(__file__).resolve().parents[2]
s=(R/"packages/security/src/control-governance.ts").read_text()
for x in ["Viewer","Developer","Operator","DevOps","Security Admin","Approver","Platform Admin","tenant","workspace","service","feature","assertProductionApproval"]: assert x in s,x
m=(R/"apps/platform-control-api/migrations/025_governance_audit.sql").read_text()
for x in ["reason","ticket_reference","source_session"]: assert x in m
print("Section 25 static validation passed")
