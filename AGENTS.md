# AI coding agent execution protocol

This repository MUST follow Section 28 of the master implementation specification unless the human owner explicitly overrides it.

1. Inventory the existing repository: frameworks, services, packages, CI/CD, infrastructure, tests, secrets/configuration patterns and current production behavior.
2. Map existing code to the target bounded contexts and produce a gap matrix. Do not delete working features merely because the repository differs from the specification.
3. Create a migration plan that preserves backward compatibility and identifies high-risk areas.
4. Implement or refactor platform contracts first, then adapters, then provider selection. Avoid direct infrastructure imports in domain/application layers.
5. Add configuration schema and capability registry before adding the switch panel.
6. Implement fallbacks and failure behavior before enabling the corresponding switch.
7. Add tests for every adapter and provider/fallback pair.
8. Implement health reporting with required/optional/degraded semantics.
9. Implement control-plane read-only screens before write controls.
10. For each write control, add dependency validation, policy checks, impact analysis, audit, approval, orchestration, verification and rollback.
11. Implement Terraform/IaC and Git-based desired state before allowing production infrastructure mutation from the UI.
12. Add security scanning, observability and CI/CD gates before declaring production-ready.
13. Run full unit/integration/E2E/security/performance/resilience/restore tests.
14. Produce an implementation report showing changed files, migrations, tests, security findings, remaining gaps and completion percentage by capability.
15. Do not claim completion if tests or deployment evidence are missing.

## Required per-phase deliverables
- Code changes with exact file paths.
- Database migrations.
- Configuration schema changes.
- Infrastructure/IaC changes.
- Automated tests.
- Security/permission changes.
- Telemetry/dashboard additions.
- Rollback/migration instructions.
- Acceptance evidence.
- Known risks and deferred items.

## Enforcement
A phase is not complete merely because files exist. Acceptance evidence must distinguish source-level implementation from executed runtime/deployment proof. Missing evidence must remain explicitly recorded in the implementation report and production-readiness gates.
