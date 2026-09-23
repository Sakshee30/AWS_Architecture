# GitOps desired-state workflow

Git is the source of truth for infrastructure and production capability state.

1. Platform Control Center creates a change request; it never runs shell commands or deletes AWS resources directly.
2. Dependency/policy validation and impact analysis must pass.
3. The orchestrator creates or updates a desired-state change on a branch/PR.
4. CI runs formatting, tests, security/IaC scans and Terraform plan.
5. Production Amber/Red changes wait for the required approval.
6. Terraform apply or GitOps reconciliation runs with workload identity/short-lived credentials.
7. The immutable application image is deployed without rebuilding.
8. Smoke tests and CloudWatch/SLO health gates verify actual state.
9. The change is completed only when desired state, actual state and health agree.
10. Failure transitions to rollback using the previous configuration/IaC revision.

Application provider configuration and Terraform enable flags must agree: enable_redis, enable_msk, enable_opensearch, enable_eks and enable_gpu_nodes. Drift is an operational failure and must be surfaced, never silently accepted.
