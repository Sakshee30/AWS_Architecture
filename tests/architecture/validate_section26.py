from pathlib import Path
R=Path(__file__).resolve().parents[2]
required=['tests/architecture/forbidden_imports.py','docs/testing/quality-gates.md','.github/workflows/quality-matrix.yml']
for f in required: assert (R/f).exists(),f
policy=(R/'docs/testing/quality-gates.md').read_text().lower()
for token in ['unit','integration','contract','architecture','e2e','security','performance','resilience','chaos','backup','migration','control plane']:
 assert token in policy,token
forbidden=(R/'tests/architecture/forbidden_imports.py').read_text()
for token in ['redis','kafka','aws-sdk','frontend cannot import database packages']:
 assert token.lower() in forbidden.lower(),token
print('Section 26 validation passed')
