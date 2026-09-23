# Section 17 acceptance evidence

Implemented repository artifacts:
- Multi-stage, non-root API and web Dockerfiles aligned to the teammate's Node/TypeScript pipeline.
- Pinned base images, health checks and SIGTERM handling.
- Compose profiles: minimal, standard and full.
- Read-only filesystems, dropped Linux capabilities and no-new-privileges.
- ECS Fargate Terraform with private networking, immutable image digest validation, health checks, deployment circuit-breaker rollback and autoscaling.
- EKS Terraform with private endpoint, standard node group and optional dedicated GPU node group.
- Kubernetes namespaces for ingress, platform, application, workers, observability and security.
- Startup/readiness/liveness probes where liveness is independent of optional Redis/Kafka/OpenSearch.
- HPA for APIs and KEDA queue-driven worker autoscaling.
- PodDisruptionBudgets, resource requests/limits and NetworkPolicies.
- Dedicated GPU workload placement example.
- Immutable digest promotion script and per-environment promotion records.

Validation still required before Section 17 can be marked accepted:
- docker build for each image
- docker compose config for minimal/standard/full
- image vulnerability scan
- terraform fmt/validate/plan
- kubectl/kubeconform validation
- architecture/policy tests
- deployment evidence showing the exact same image digest promoted DEV -> TEST -> STAGING -> PROD

Per the master specification, missing test/deployment evidence is reported rather than hidden.
