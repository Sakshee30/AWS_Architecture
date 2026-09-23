# Workflow service

Workflow execution application service.

Definitions and run state stay behind a repository port; execution is placed on the configured `JobQueuePort`. The service applies permissions, tenant/workspace scope, idempotency metadata, bounded retries, and correlation IDs before a job leaves the application boundary.
