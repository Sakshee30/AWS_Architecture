# Master implementation sequence
1 Architecture foundation — bounded contexts, ports/adapters, DI, schema, registry, architecture tests.
2 Core platform — authn/authz, tenant context, PostgreSQL, migrations, audit, errors.
3 Infrastructure abstractions — Cache/Queue/EventBus/ObjectStorage/Search/Secret/AI ports.
4 Fallbacks — memory/no-cache, PostgreSQL locks/idempotency, sync dev jobs, outbox, local storage, PostgreSQL search.
5 Production providers — Redis, SQS, Kafka/MSK, S3, OpenSearch, SES, Secrets Manager.
6 Reliability — outbox/inbox, retry/DLQ, circuit breakers, health, graceful degradation.
7 Observability — OTel, metrics, tracing, logs, dashboards, alerts, audit separation.
8 Security — WAF/IAM/secrets/scanning/SBOM/signing/upload/threat models.
9 AWS foundation — accounts/VPC/RDS/S3/SQS/Secrets/CloudWatch/ECR.
10 Containers/orchestration — Docker/Compose/ECS/EKS/HPA/KEDA/NetworkPolicy.
11 IaC/GitOps — Terraform/Helm/GitOps/drift/release promotion.
12 Control Center — read-only dashboard, registry/dependencies/health/AppConfig.
13 Safe changes — requests/impact/approval/provider migration/rollback/orchestration.
14 FinOps/DR/chaos — cost/RPO/RTO/restore/chaos/runbooks.
15 Production readiness — load/security/DR/SLO/final hardening/evidence.

Sections 16–30 extend, never replace, the teammate's 1–15 implementation. Merge must preserve ports/adapters and working business behavior.
