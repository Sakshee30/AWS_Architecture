# Section 24 performance and capacity test plan

Execute all six required profiles: normal, peak, 2x peak, spike, soak and failure-injection.

For every profile record:
- latency P50/P95/P99, throughput, error rate and saturation;
- database connection use, slow queries and query plans;
- queue depth/age and worker concurrency;
- CPU, memory and container/pod saturation;
- payload sizes and timeout behavior.

The review MUST look for N+1 queries, full table/index scans, missing indexes, unbounded pagination, huge payloads, expensive joins and sustained memory growth.

Central limits come from config/limits.yaml and cover max request size, upload size, page size, query depth, timeout, batch size and worker concurrency.

Cost attribution must cover RDS, NAT Gateway, MSK, OpenSearch, EKS, GPU, S3, data transfer, logs and AI inference. All AWS resources must carry Application, Environment, Service, Owner and CostCenter tags.

Do not treat estimated savings as authority to disable infrastructure. Any cost-aware recommendation remains advisory and still passes dependency, health, policy and approval gates.
