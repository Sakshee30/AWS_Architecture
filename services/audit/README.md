# Audit service

Append-only audit application service for sensitive and operational actions.

The service owns audit record construction, tenant/workspace scope, correlation identifiers, bounded reads, and recursive redaction of secret-like fields. Persistence is provided through an `AuditRepository`; callers cannot update or delete historical records through this contract.
