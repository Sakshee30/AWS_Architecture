# Section 18 acceptance — IaC, GitOps and change orchestration

Status: IMPLEMENTED / VALIDATION PENDING

Implemented:
- Terraform modules required by the master specification: VPC, ALB, ECS, EKS, RDS, Redis, S3, SQS, Kafka/MSK, OpenSearch, IAM, Secrets and Monitoring.
- Reusable platform-environment composition and explicit optional flags: enable_redis, enable_msk, enable_opensearch, enable_eks, enable_gpu_nodes.
- DEV/TEST/STAGING/PROD roots using the same module contract and environment-scoped desired state.
- Git source-of-truth workflow with validation, plan, approval, apply/reconciliation, deployment, health verification and rollback.
- Step Functions ASL state machine contract for long-running controlled changes. Browser credentials are not part of the contract.
- Static Section 18 architecture test.

Acceptance still requires CI/AWS evidence:
- terraform fmt -check -recursive
- terraform init -backend=false and terraform validate for every environment
- IaC/security scanner results
- Terraform plans against authorized AWS accounts
- Step Functions deployment/integration smoke evidence
- Drift/rollback exercise evidence

Do not start Section 19 until the Section 18 validation gate is accepted or the owner explicitly authorizes implementation to continue while external AWS validation remains pending.
