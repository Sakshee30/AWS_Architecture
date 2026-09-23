# Section 29 acceptance — Definition of Done and Acceptance Criteria
Status: IMPLEMENTED / RUNTIME EVIDENCE REQUIRED

Section 29 is now encoded as a fail-closed Definition-of-Done policy. Every acceptance area from the master specification is represented explicitly: architecture, configuration, Redis-off, Kafka-off, Search-off, AI-off, compute portability, control panel, production changes, security, observability, resilience, Backup/DR, CI/CD and documentation.

scripts/check-definition-of-done.py now refuses to declare completion when runtime evidence is missing or incomplete. It requires evidence/definition-of-done.json to confirm architecture/config validation, fallback tests, compute portability, control-panel verification, production-change verification, security gates, runtime observability, resilience failure tests, restore tests, protected-main/workflow execution and documentation review.

This prevents source-file presence from being mistaken for actual acceptance and follows Section 28's rule that completion must not be claimed without test/deployment evidence.

Automated source validation: tests/architecture/validate_section29.py.
