# Identity service

Application boundary around verified identities.

OIDC/JWT verification stays in the security package. This service consumes the already-verified `TenantContext`, resolves tenant-owned user profiles, rejects suspended identities, and centralizes privileged-role/MFA checks without handling raw passwords or issuing credentials.
