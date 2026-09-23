from pathlib import Path
R=Path(__file__).resolve().parents[2]
dod=R/'config/definition-of-done.yaml'; checker=R/'scripts/check-definition-of-done.py'
assert dod.exists() and checker.exists()
t=dod.read_text().lower()
for token in ['architecture','configuration','redis_off','kafka_off','search_off','ai_off','compute_portability','control_panel','production_changes','security','observability','resilience','backup_dr','cicd','documentation']:
 assert token in t,token
print('Section 29 validation passed')
