# AI coding agent execution protocol
1. Inventory repository/frameworks/services/packages/CI/infrastructure/tests/config/current behavior.
2. Map bounded contexts/gaps; do not delete working features.
3. Plan backward-compatible migration and high-risk areas.
4. Contracts first, then adapters/provider selection; no infrastructure SDKs in domain/application.
5. Configuration schema/capability registry before switch UI.
6. Fallback/failure behavior before a switch.
7. Test every adapter and provider/fallback pair.
8. Health uses required/optional/degraded semantics.
9. Read-only control plane before writes.
10. Every write includes dependency validation, policy, impact, audit, approval, orchestration, verification and rollback.
11. Git/IaC desired state before production infrastructure mutation.
12. Security scanning, observability and CI/CD gates before production-ready.
13. Run unit/integration/E2E/security/performance/resilience/restore tests.
14. Report changed files, migrations, config/IaC, tests, security, telemetry, rollback, evidence, risks and completion.
15. Never claim completion without test/deployment evidence.

Per-phase deliverables: exact paths; migrations; config schema; IaC; automated tests; security/permissions; telemetry/dashboards; rollback/migration instructions; acceptance evidence; known risks/deferred items.
