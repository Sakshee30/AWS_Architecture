# Sections 16–30 integration gap matrix against Boby-Mourya/AWS

Reference: teammate main architecture and contracts.

| Area | Teammate 1–15 | Sections 16–30 alignment |
|---|---|---|
| Desired state | config-engine DesiredState + validateDesiredState/validatePlatformState | same capability names, provider catalog, required fallback and locked logging/database rules |
| Dependency validation | Redis/BullMQ, RAG and provider prerequisites | mirrored fail-fast dependency checks; destructive/provider changes remain policy-controlled |
| Switch workflows | Redis off, Kafka off, OpenSearch off, EKS→ECS, AI changes | same non-destructive workflow sequencing, fallbacks, health gates and rollback semantics |
| Policy | locked capabilities, privileged roles, production approval | same locked production capability set and risk-aware approval semantics |
| Control API | Fastify change-oriented control plane | Section 19 APIs remain change-oriented and forbid provider-specific destructive routes |
| Architecture | ports/adapters/provider registry | optional infrastructure stays outside business/domain code |
| CI/testing | root typecheck/tests plus architecture tests | integration workflow runs Sections 16–30 validators and defers teammate root workspace execution until merge |

No business-domain feature from Sections 1–15 is duplicated here. Compatibility code is limited to integration seams needed for Sections 16–30 to compile and preserve the same pipeline before the repositories are combined.
