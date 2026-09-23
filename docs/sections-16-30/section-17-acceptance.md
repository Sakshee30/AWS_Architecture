# Section 17 acceptance evidence

Implemented repository artifacts:
- Multi-stage, non-root API and web Dockerfiles aligned to the teammate's Node/TypeScript pipeline.
- Pinned base image versions, health checks and SIGTERM handling.
- Compose profiles: minimal, standard and full.
- Read-only filesystems, dropped Linux capabilities and no-new-privileges.
- ECS Fargate Terraform with private networking, read-only root filesystem, dropped capabilities, health checks, deployment circuit-breaker rollback and immutable digest enforcement.
- EKS Terraform with private endpoint, standard node group and optional dedicated GPU node group.
- Kubernetes namespaces for ingress, platform, application, workers, observability and security.
- Startup/readiness/liveness probes where liveness is independent of optional Redis/Kafka/OpenSearch.
- HPA for APIs and KEDA queue-driven worker autoscaling.
- PodDisruptionBudget, resource requests/limits and NetworkPolicy.

Validation still required before Section 17 can be declared accepted:
- docker build for each image
- docker compose config for minimal/standard/full
- image vulnerability scan
- terraform fmt/validate/plan
- kubectl/kubeconform validation
- policy checks for non-root/read-only/capability-drop
- deployment evidence showing the same image digest promoted DEV -> TEST -> STAGING -> PROD

Per the master specification, missing test/deployment evidence must be reported rather than hidden.
