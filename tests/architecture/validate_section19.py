from pathlib import Path
R=Path(__file__).resolve().parents[2]
sql=(R/'apps/platform-control-api/migrations/019_control_plane.sql').read_text()
for table in ['platform_capability','capability_dependency','platform_change','configuration_version','deployment_execution','provider_health','audit_event']:
 assert f'CREATE TABLE IF NOT EXISTS {table}' in sql, table
routes=(R/'apps/platform-control-api/src/section19/routes.ts').read_text()
for route in ['/platform/capabilities','/platform/capabilities/:id','/platform/dependencies','/platform/health','/platform/drift','/platform/config/versions','/platform/changes','/platform/changes/:id/validate','/platform/changes/:id/plan','/platform/changes/:id/approve','/platform/changes/:id/apply','/platform/changes/:id/rollback','/platform/changes/:id/status','/platform/config/:version/activate']:
 assert route in routes, route
for forbidden in ['/delete-redis','child_process','exec(']: assert forbidden not in routes, forbidden
assert 'validatePlatformState' in routes
assert 'evaluatePlatformPolicy' in routes
service=(R/'apps/platform-control-api/src/section19/service.ts').read_text()
assert 'SEPARATION_OF_DUTIES' in service
assert 'LOCKED_CAPABILITY' in service
repo=(R/'apps/platform-control-api/src/section19/repository.ts').read_text()
for token in ['listCapabilities','getCapability','listDependencies','listConfigVersions','getChange','saveChange','activateConfigVersion','providerHealth','appendAudit']:
 assert token in repo, token
memory=(R/'apps/platform-control-api/src/section19/memory-repository.ts').read_text()
assert 'class InMemoryControlPlaneRepository' in memory
postgres=(R/'apps/platform-control-api/src/section19/postgres-repository.ts').read_text()
for token in ['class PostgresControlPlaneRepository','SqlExecutor','BEGIN','ROLLBACK','audit_event','provider_health']:
 assert token in postgres, token
print('Section 19 integration-aware validation passed')
