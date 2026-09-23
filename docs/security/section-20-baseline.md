# Section 20 cybersecurity baseline
Edge: CloudFront/WAF/DDoS controls, TLS/HSTS, private application and isolated data subnets, least-privilege SG/NetworkPolicy, private endpoints where practical.
Application: schema validation, server-side authorization, injection/XSS/CSRF/SSRF/path traversal/deserialization/upload/replay defenses, secure cookies and safe redirects, sanitized errors.
Secrets: no plaintext production secrets in Git/images/frontend/plain YAML; SecretProvider; KMS-managed encryption; rotation; field encryption where classification requires.
Supply chain gates are implemented in Section 21: SAST, SCA, secret/IaC/container scanning, SBOM, signing, trusted registries, pinned actions/dependencies and provenance.
