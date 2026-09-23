# Reporting service

Tenant-scoped asynchronous reporting.

Report requests are validated, persisted through a repository port, and dispatched to the job queue. The service owns report lifecycle metadata while workers own rendering and object-storage delivery.
