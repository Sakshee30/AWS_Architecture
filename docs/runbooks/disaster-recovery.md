# Disaster recovery
Periodic restore testing is mandatory. Quarterly exercises cover:
1. RDS automated-backup/PITR restore into an isolated recovery target and integrity verification.
2. Service redeployment from the same immutable image digest and Git/IaC desired state.
3. Queue/DLQ recovery and idempotent replay.
4. S3 object/version recovery and lifecycle/replication validation where replication is enabled.
5. Configuration/AppConfig and IaC recovery from version control.
6. Secrets Manager recovery/rotation without recording plaintext secrets.
7. Region-failure procedure/tabletop and cross-region recovery only where business continuity requires it.

Record exercise ID, capability, owner, timestamp, achieved RPO/RTO, integrity result, gaps and corrective action. Prefer Multi-AZ before active-active multi-region. Never declare Backup/DR ready without successful restore evidence.
