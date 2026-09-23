from pathlib import Path
R=Path(__file__).resolve().parents[2]
p=R/'AGENTS.md'; assert p.exists()
t=p.read_text().lower()
for n in range(1,16): assert f'{n}.' in t,f'protocol step {n}'
for token in [
 'inventory the existing repository','gap matrix','backward compatibility','contracts first',
 'configuration schema and capability registry','fallbacks and failure behavior',
 'tests for every adapter and provider/fallback pair','required/optional/degraded',
 'read-only screens before write controls','dependency validation','impact analysis',
 'orchestration','verification and rollback','terraform/iac and git-based desired state',
 'security scanning, observability and ci/cd gates','unit/integration/e2e/security/performance/resilience/restore tests',
 'completion percentage by capability','do not claim completion'
]:
 assert token in t,token
for token in ['exact file paths','database migrations','configuration schema changes','infrastructure/iac changes','automated tests','security/permission changes','telemetry/dashboard additions','rollback/migration instructions','acceptance evidence','known risks and deferred items']:
 assert token in t,token
r=(R/'docs/implementation/completion-report-template.md').read_text().lower()
for token in ['source/code/config/iac completion','runtime/deployment evidence completion','production readiness','configuration schema changes','telemetry/dashboard additions','acceptance evidence','remaining gaps','rollback/migration instructions']:
 assert token in r,token
print('Section 28 AI execution protocol validation passed')
