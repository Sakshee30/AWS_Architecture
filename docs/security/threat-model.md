# STRIDE threat model baseline

Every major feature must extend this model before production.

| Abuse case | Primary controls | Verification |
|---|---|---|
| Cross-tenant access | server-side authz, TenantContext, scoped repositories/RLS | cross-tenant negative tests |
| Webhook replay | HMAC/signature, timestamp window, idempotency key/inbox | replay/invalid-signature tests |
| Duplicate queue delivery | idempotent workers, inbox/idempotency store | duplicate-delivery resilience test |
| Redis outage | circuit breaker and DB/memory fallbacks | dependency failure test |
| AI prompt injection | authorized retrieval, content boundaries, output validation | adversarial RAG tests |
| Leaked signed URL | short TTL, scoped object key, auth before issuance | expired/cross-tenant URL tests |
| Privileged account compromise | MFA/OIDC, least privilege, SoD, immutable audit | privilege escalation tests |

STRIDE review covers spoofing, tampering, repudiation, information disclosure, denial of service and elevation of privilege. Findings must have owner, severity and remediation status.
