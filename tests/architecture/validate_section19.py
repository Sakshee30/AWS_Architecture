from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
sql=(ROOT/"apps/platform-control-api/migrations/019_control_plane.sql").read_text()
for table in ("platform_capability","capability_dependency","platform_change","configuration_version","deployment_execution","provider_health","audit_event"):
    assert f"CREATE TABLE IF NOT EXISTS {table}" in sql
routes=(ROOT/"apps/platform-control-api/src/section19/routes.ts").read_text()
for endpoint in ("/platform/capabilities","/platform/dependencies","/platform/health","/platform/drift","/platform/config/versions","/platform/changes/:id/status","/platform/config/:version/activate"):
    assert endpoint in routes
assert "delete-redis" not in routes.lower()
assert "REPOSITORY_STATUS_ROUTE_REQUIRES_ADAPTER" not in routes
service=(ROOT/"apps/platform-control-api/src/section19/service.ts").read_text()
assert "SEPARATION_OF_DUTIES" in service
assert "LOCKED_CAPABILITY" in service
print("Section 19 static contract validation passed")
