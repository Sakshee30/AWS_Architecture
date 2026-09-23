# Section 25 acceptance — Platform Control Center Security and Governance
Status: IMPLEMENTED / RUNTIME AUTHORIZATION AND AUDIT EVIDENCE PENDING

Implemented the Section 25 governance contract:
- RBAC roles: Viewer, Developer, Operator, DevOps, Security Admin, Approver and Platform Admin with scoped permissions.
- production separation-of-duties guard so requestor and approver cannot be the same for production-critical changes.
- governance audit record covering actor, action, environment, old value, desired value, reason, ticket/reference, approval, execution result, source session, rollback linkage and timestamp.
- additive governance migration fields/indexes for source session, approval session, execution result, ticket/reference and rollback linkage.
- all emergency controls required by the specification: new signups, file uploads, AI, inbound/external webhook processing, outbound integrations, read-only mode and maintenance mode.
- maintenance scopes for platform, tenant, workspace, service and feature with validation so scoped maintenance cannot accidentally become platform-wide.

Source implementation deliberately does not bypass the existing control-plane policy/change workflow. Emergency and governance actions must still flow through authorization, audit and environment policy.

Production acceptance remains pending until the merged Sections 1–15 identity/auth context is wired into these guards and API-level authorization/audit tests execute with retained evidence.
