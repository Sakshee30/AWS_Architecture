# Section 20 threat model (STRIDE)

This is the mandatory baseline threat model. Each new major feature extends it before release.

| Threat / abuse case | Boundary | Required mitigation | Verification |
|---|---|---|---|
| Cross-tenant access | API/data/cache/queue/search/AI | server-side authz + TenantContext + scoped keys/queries | cross-tenant negative tests |
| Webhook replay/forgery | public webhook edge | signature, timestamp window, idempotency key | replay/signature tests |
| Injection/XSS/CSRF | browser/API | schema validation, output encoding, CSP, secure cookies/CSRF | SAST/DAST/security tests |
| SSRF / unsafe redirect | integrations | HTTPS + destination allow-list + network egress policy | URL validator tests |
| Malicious upload | object storage | quarantine, size/MIME/magic-byte/malware/archive checks | upload attack suite |
| Duplicate queue delivery | workers | idempotent consumer + inbox/idempotency store | duplicate delivery test |
| Redis outage | cache/lock/idempotency | circuit breaker + documented PostgreSQL/memory fallback | resilience test |
| AI prompt injection | AI/RAG | authz before retrieval, content boundaries, tool allow-list, output validation | adversarial RAG tests |
| Leaked signed URL | S3 | short TTL, scoped key/prefix, audit, no public bucket | policy/security tests |
| Privileged compromise | control plane | MFA/SSO, least privilege, SoD, immutable audit, short-lived credentials | IAM/control-plane tests |

Security controls that are locked by the master specification are never represented as disable switches.
