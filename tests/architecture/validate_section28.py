from pathlib import Path
R=Path(__file__).resolve().parents[2]
p=R/'AGENTS.md'; assert p.exists()
t=p.read_text().lower()
for n in range(1,16): assert f'{n}.' in t,f'protocol step {n}'
for token in ['exact paths','migrations','config schema','iac','automated tests','security/permissions','telemetry','rollback','acceptance evidence','known risks']:
 assert token in t,token
print('Section 28 validation passed')
