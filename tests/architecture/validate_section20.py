from pathlib import Path
R=Path(__file__).resolve().parents[2]
for p in ["packages/security/src/webhook-security.ts","packages/security/src/http-security.ts","infrastructure/terraform/modules/waf/main.tf","docs/security/threat-model.md"]:
 assert (R/p).exists(),p
w=(R/"packages/security/src/webhook-security.ts").read_text()
for x in ["timingSafeEqual","WEBHOOK_REPLAY_REJECTED","SSRF_DESTINATION_FORBIDDEN"]: assert x in w
t=(R/"docs/security/threat-model.md").read_text().lower()
for x in ["cross-tenant","webhook replay","duplicate queue","redis outage","prompt injection","signed url","privileged account"]: assert x in t,x
print("Section 20 static validation passed")
