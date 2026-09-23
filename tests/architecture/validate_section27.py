from pathlib import Path
R=Path(__file__).resolve().parents[2]
p=R/'docs/implementation/phase-map.md'
assert p.exists()
t=p.read_text().lower()
for i in range(1,16):
 assert f'phase {i}' in t, f'phase {i}'
required={
1:['architecture foundation','bounded contexts','ports/adapters','dependency injection','config schema','capability registry','architecture tests'],
2:['core platform','authentication','authorization','tenant context','postgresql','migrations','audit','standard errors'],
3:['infrastructure abstractions','cacheport','queueport','eventbusport','objectstorageport','searchport','secretprovider','aimodelport'],
4:['fallback implementations','memory/no-cache','postgresql locks/idempotency','synchronous dev jobs','outbox','local storage','postgresql search'],
5:['production providers','redis','sqs','kafka/msk','s3','opensearch','ses','secrets manager'],
6:['reliability','outbox/inbox','retry/dlq','circuit breakers','health','graceful degradation'],
7:['observability','opentelemetry','metrics','tracing','structured logs','dashboards','alerts','audit separation'],
8:['security hardening','waf','iam','secrets','scanning','sbom','signing','upload security','threat models'],
9:['aws foundation','organizations/accounts','vpc','rds','s3','sqs','secrets manager','cloudwatch','ecr'],
10:['containers and orchestration','docker','compose','ecs','eks','hpa/keda','networkpolicy'],
11:['iac/gitops','terraform modules','helm','gitops','drift detection','release promotion'],
12:['platform control center','read-only dashboard','capability registry','dependencies','health','appconfig switches'],
13:['safe change workflows','change requests','impact analysis','approvals','provider migration','rollback','step functions'],
14:['finops/dr/chaos','cost panel','rpo/rto','restore testing','resilience hub/chaos','operational runbooks'],
15:['production readiness','load/security/dr tests','slos','final hardening','launch checklist','evidence']
}
for i,tokens in required.items():
 for token in tokens:
  assert token in t, f'phase {i} missing {token}'
for rule in ['contracts and configuration precede provider switches','fallbacks and failure behavior precede enabling switches','read-only control-plane capability views precede write controls','git/iac desired state precedes production infrastructure mutation','runtime/deployment evidence remains mandatory']:
 assert rule in t,rule
print('Section 27 implementation sequence validation passed')
