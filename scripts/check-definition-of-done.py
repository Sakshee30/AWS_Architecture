from pathlib import Path
R=Path(__file__).resolve().parents[1]
required=["AGENTS.md","config/definition-of-done.yaml","docs/runbooks/disaster-recovery.md","docs/security/threat-model.md",".github/workflows/pr-quality-security.yml",".github/workflows/build-release.yml"]
missing=[x for x in required if not (R/x).exists()]
if missing: raise SystemExit("DoD structure missing: "+", ".join(missing))
print("DoD structure present. Runtime/security/load/restore/deployment evidence must still be verified; this check does not declare production readiness.")
