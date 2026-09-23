# Section 20 acceptance — Cybersecurity Architecture
Status: IMPLEMENTED / EXECUTION EVIDENCE PENDING

Implemented edge/network/application/supply-chain security controls required by Section 20:
- WAF managed common and known-bad-input rules plus IP rate limiting.
- HTTPS/HSTS/CSP/X-Content-Type-Options/Referrer-Policy/Permissions-Policy response policy.
- Outbound URL validation with HTTPS allow-listing and IPv4/IPv6 private/link-local SSRF rejection.
- Webhook HMAC signature verification, timestamp replay window and timing-safe comparison.
- Sensitive-value redaction for credentials, cookies, tokens, API keys, payment and document content fields.
- KMS-backed infrastructure encryption primitives and an application-level AES-256-GCM field-encryption service behind a DataKeyProvider contract.
- STRIDE baseline covering cross-tenant access, webhook replay, duplicate queue delivery, Redis outage, AI prompt injection, leaked signed URLs and privileged compromise.
- CI security gates for secret scanning, SAST/CodeQL, dependency audit when a lockfile is available, IaC scanning and container image vulnerability scanning.

This implementation preserves the master architecture rule: cloud/security providers stay behind contracts and production security controls are not exposed as disable switches.

Automated static validation: tests/architecture/validate_section20.py.

Production acceptance still requires real workflow execution, DAST/penetration evidence, KMS/Secrets Manager integration evidence, WAF deployment evidence, and retained scan artifacts. These are intentionally not claimed until executed.
