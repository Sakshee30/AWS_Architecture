# Section 16 — AWS Configuration and Secret Services

## Required services
- AWS AppConfig: runtime feature flags, provider selections, kill switches, limits, gradual rollout and rollback.
- SSM Parameter Store: hierarchical non-secret platform configuration.
- Secrets Manager: database/API/OAuth/SMTP/third-party secrets and rotation.
- KMS: customer/platform encryption keys.
- CloudTrail: AWS-side activity/audit evidence.
- AWS Config: resource configuration history and drift evidence.

## Security invariant
The control plane exposes secret metadata only: configured state, health, rotation status and last rotation. Plaintext secret values must never be returned to the UI, logs, audit records, Git, images or configuration files.

## Integration contract
Sections 1–15 own the application SecretProvider/capability contracts. This section supplies AWS-side adapters and desired-state resources only; it must not introduce AWS SDK imports into domain/application code.
