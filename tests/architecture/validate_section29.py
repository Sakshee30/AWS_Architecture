from pathlib import Path
R=Path(__file__).resolve().parents[2]
dod=R/'config/definition-of-done.yaml'; checker=R/'scripts/check-definition-of-done.py'
assert dod.exists() and checker.exists()
t=dod.read_text().lower()
for token in ['architecture','configuration','redis_off','kafka_off','search_off','ai_off','compute_portability','control_panel','production_changes','security','observability','resilience','backup_dr','cicd','documentation']:
 assert token in t,token
for token in ['business/domain code','invalid combinations fail','approved fallbacks','no event loss','postgresql fallback','non-ai platform','same immutable application images','desired state, actual state','validation, approval','no plaintext production secrets','correlation ids','failure-mode tests','restore tests succeed','main is protected','operational runbooks']:
 assert token in t,token
c=checker.read_text().lower()
for token in ['definition-of-done.json','not ready','architecture_tests','redis_off_test','kafka_off_test','backup_restore_tests','cicd_protection_and_runs','definition of done complete']:
 assert token in c,token
print('Section 29 Definition-of-Done validation passed')
