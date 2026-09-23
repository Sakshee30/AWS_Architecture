# Operations aggregation service

This bounded context collects read-only operational summaries for the Platform Control Center.

It intentionally exposes **metadata and aggregate findings**, not credentials, secret values, document contents, or raw authentication tokens. AWS access must come from workload identity/IAM rather than static credentials.

The collector currently supports:

- CloudWatch platform traffic, latency, error, saturation, and security-event signals;
- GuardDuty finding counts;
- Security Hub finding counts by normalized severity;
- Inspector vulnerability finding counts;
- CloudTrail administrative activity summaries;
- Cost Explorer month-to-date cost totals; and
- AWS Backup job status summaries.

Collection is disabled unless `AWS_OPERATIONS_COLLECTION_ENABLED=true`. Production deployments should grant the control-plane workload a dedicated read-only IAM policy for only the APIs required by this service.
