# Pipeline alignment with Sections 1–15 repository

Reference repository reviewed: Boby-Mourya/AWS main.

Observed architecture to preserve:
- TypeScript/Node monorepo with npm workspaces.
- Repository roots include apps/, services/, packages/, adapters/, config/, infrastructure/, tests/ and .github/.
- Ports/contracts live under packages/capability-contracts and shared types under packages/contracts.
- Provider selection is centralized through packages/platform-sdk/src/provider-registry.ts.
- Capability/deployment profiles are represented in config JSON.
- Architecture tests enforce inward dependencies and block direct infrastructure SDK imports in domain/application code.

Sections 16–30 in this repository must integrate with those boundaries rather than introduce business-domain infrastructure coupling.
