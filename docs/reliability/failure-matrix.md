# Section 23 failure mode matrix
| Failure | Required behavior |
|---|---|
| Redis down | Open circuit breaker; bypass cache and use database/PostgreSQL lock/idempotency fallback; supported app requests remain available. |
| Kafka/MSK down | Transactional outbox retains events; use configured fallback route; no business-event loss. |
| OpenSearch down | Route SearchPort reads to PostgreSQL fallback. |
| Worker down | Durable queue retains the job; replacement worker processes it later. |
| Pod/task down | ECS/EKS orchestrator replaces the workload. |
| Availability Zone failure | Multi-AZ workloads continue according to the deployed design. |
| AI provider down | Route to fallback model or mark only AI capability degraded; unrelated platform functions continue. |
| S3 temporary issue | Use bounded transient retry/queue where designed; otherwise return a clear storage error without data corruption. |
| CRM/integration down | Transient-only retry with jitter, circuit breaker and DLQ. |
| Email down | Queue notification and retry; DLQ after bounded attempts. |

Common controls are explicit timeouts, transient-only retries, exponential backoff with jitter, circuit breakers, bulkheads for constrained dependencies, idempotency, DLQs, graceful degradation/shutdown, required-vs-optional health checks, and automatic rollback after failed verification.
