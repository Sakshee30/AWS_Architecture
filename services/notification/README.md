# Notification service

Tenant-scoped notification orchestration.

The application service validates delivery requests and queues them through `JobQueuePort`. Provider credentials, retries, and network clients remain in adapters/workers rather than leaking into the domain layer.
