# Sections 16–30 integration gap matrix against Boby-Mourya/AWS

Reference baseline: teammate main architecture/contracts, currently treated as the Sections 1–15 source of truth.

| Area | Teammate Sections 1–15 | Sections 16–30 alignment |
|---|---|---|
| Desired state | config-engine DesiredState + validation | same capability names, provider catalog, required fallback and locked production rules |
| Dependency validation | Redis/BullMQ, RAG and provider prerequisites | mirrored fail-fast dependency checks; destructive/provider changes remain policy controlled |
| Provider model | ports/adapters/provider registry | Sections 16–30 add only operational/infrastructure adapters and orchestration seams |
| Switch workflows | Redis/Kafka/OpenSearch/AI/compute migration semantics | same non-destructive sequencing, fallback, health-gate and rollback behavior |
| Policy | locked capabilities, privileged roles, production approval | same separation-of-duties and risk-aware production change policy |
| Control API | change-oriented control-plane approach | Section 19 remains change-oriented and contains no provider-specific destructive endpoint |
| Security | auth/tenant boundary remains application-owned | Sections 20/25 extend edge, secrets, scanning, governance and audit without bypassing authz |
| Runtime reliability | fallback providers/outbox/idempotency come from 1–15 contracts | Section 23 adds generic timeout/retry/circuit/DLQ/health/rollback controls around those contracts |
| CI/testing | teammate workspace supplies concrete app/provider tests | Sections 21/26 add release/security/architecture/chaos/backup quality gates |
| IaC/AWS | target architecture from Sections 15+ | Sections 16–18 add AppConfig/Secrets/KMS/audit, Docker/ECS/EKS, Terraform/GitOps/orchestration |
| Observability/FinOps | app emits domain/runtime signals | Sections 22/24 add telemetry contract, SLO/alerts, budgets/anomaly and advisory cost model |

## Known integration dependencies
- Final runtime wiring of PostgresControlPlaneRepository must happen in the teammate composition root after repository merge.
- Real provider/fallback tests for Redis/SQS/Kafka/S3/OpenSearch/AI require the merged Sections 1–15 adapters.
- Production auth context must be injected into Section 25 governance checks by the existing identity/authorization layer.
- CI scripts that rely on the teammate root workspace remain evidence-gated until repositories are combined.

No working Sections 1–15 feature should be deleted or duplicated during integration.
