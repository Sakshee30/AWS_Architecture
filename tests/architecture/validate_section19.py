from pathlib import Path
R=Path(__file__).resolve().parents[2]
sql=(R/'apps/platform-control-api/migrations/019_control_plane.sql').read_text()
for table in ['platform_capability','capability_dependency','platform_change','configuration_version','deployment_execution','provider_health','audit_event']:
 assert f'CREATE TABLE IF NOT EXISTS {table}' in sql, table
routes=(R/'apps/platform-control-api/src/section19/routes.ts').read_text()
for route in ['/platform/capabilities','/platform/dependencies','/platform/health','/platform/drift','/platform/config/versions','/platform/changes','/platform/config/:version/activate','/platform/changes/:id/status']:
 assert route in routes, route
for forbidden in ['/delete-redis','child_process','exec(']: assert forbidden not in routes, forbidden
assert 'validatePlatformState' in routes
assert 'evaluatePlatformPolicy' in routes
service=(R/'apps/platform-control-api/src/section19/service.ts').read_text()
assert 'SEPARATION_OF_DUTIES' in service
assert 'LOCKED_CAPABILITY' in service
print('Section 19 integration-aware validation passed')
