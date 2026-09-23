# Integration with teammate Sections 1–15

Reference repository: Boby-Mourya/AWS.

Sections 16–30 consume the same architectural contracts rather than introducing a parallel platform model.

Alignment points:
- Control-plane validation uses the teammate config-engine validatePlatformState.
- Production approval policy uses the teammate policy-engine evaluatePlatformPolicy.
- Risk classes map to the master switch semantics: Green runtime, Blue application-provider, Amber infrastructure, Red compute migration, Locked immutable production capabilities.
- Section 19 change APIs remain change-oriented; provider-specific destructive endpoints are forbidden.
- Domain/business layers remain free of AWS/Redis/Kafka/OpenSearch/Kubernetes client imports.
- Infrastructure/provider selection remains driven by desired state and adapters.
- Existing Sections 1–15 behavior is preserved; Sections 16–30 are additive.

Before combining repositories, the integration branch must run the teammate repository's typecheck/tests plus Sections 16–30 architecture/IaC/security checks.
