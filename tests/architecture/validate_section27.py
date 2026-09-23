from pathlib import Path
R=Path(__file__).resolve().parents[2]
p=R/'docs/implementation/phase-map.md'; assert p.exists()
t=p.read_text().lower()
for i in range(1,16): assert f'{i} ' in t or f'phase {i}' in t,f'phase {i}'
for token in ['architecture foundation','core platform','fallback','production providers','reliability','observability','security','aws foundation','containers','iac/gitops','control center','safe changes','finops/dr/chaos','production readiness']:
 assert token in t,token
print('Section 27 validation passed')
