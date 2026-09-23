# Quality gates

The Section 26 matrix is mandatory and maps directly to CI jobs/scripts.

| Layer | Required coverage | CI/script |
|---|---|---|
| Unit | domain rules, adapters, factories, validators | test:unit |
| Integration | database, Redis, SQS, Kafka, S3, search adapters | test:integration |
| Contract | REST/OpenAPI, events, provider interfaces | test:contract |
| Architecture | forbidden imports and dependency direction | tests/architecture/forbidden_imports.py |
| E2E | critical user journeys | test:e2e |
| Security | authz, cross-tenant, upload, webhook replay, input attacks | test:security |
| Performance | load, spike, soak, query performance | test:performance |
| Resilience | dependency failures, retries, circuit breakers, DLQ | test:resilience |
| Chaos | Redis/Kafka/RDS/pod/network/AI failures in safe environments | test:chaos |
| Backup | restore validation | test:backup-restore |
| Migration | forward/backward compatibility and expand-contract | test:migration |
| Control plane | dependency validation, approval, apply, rollback, drift | test:control-plane |

Mandatory architecture rules:
- Domain cannot import Redis clients.
- Domain cannot import Kafka clients.
- Domain cannot import AWS SDK.
- Frontend cannot import database packages.
- Controllers cannot access ORM directly except through approved application/repository boundaries.
- Adapters may depend on infrastructure SDKs; domain may not depend on adapters.

A missing test script is not considered passing evidence in production. CI may skip only when running before the Sections 1–15 workspace is integrated; production readiness remains blocked until all required scripts execute successfully.
