#!/usr/bin/env python3
from pathlib import Path
import json

R=Path(__file__).resolve().parents[1]
REQUIRED_SOURCE=[
 "AGENTS.md",
 "config/definition-of-done.yaml",
 "docs/implementation/phase-map.md",
 "docs/reliability/failure-matrix.md",
 "docs/runbooks/disaster-recovery.md",
 "docs/security/section20-threat-model.md",
 ".github/workflows/pr-quality-security.yml",
 ".github/workflows/build-release.yml",
 ".github/workflows/promote.yml",
 "tests/architecture/forbidden_imports.py",
]
missing=[x for x in REQUIRED_SOURCE if not (R/x).exists()]
if missing:
 raise SystemExit("DoD source requirements missing: "+", ".join(missing))

evidence_file=R/"evidence/definition-of-done.json"
if not evidence_file.exists():
 raise SystemExit("NOT READY: runtime Definition-of-Done evidence missing at evidence/definition-of-done.json")

evidence=json.loads(evidence_file.read_text())
required=[
 "architecture_tests",
 "configuration_validation",
 "redis_off_test",
 "kafka_off_test",
 "search_off_test",
 "ai_off_test",
 "compute_portability",
 "control_panel_verification",
 "production_change_verification",
 "security_gates",
 "observability_runtime",
 "resilience_failure_tests",
 "backup_restore_tests",
 "cicd_protection_and_runs",
 "documentation_review",
]
failed=[k for k in required if evidence.get(k) not in (True,"passed","complete")]
if failed:
 raise SystemExit("NOT READY: Definition-of-Done evidence incomplete: "+", ".join(failed))
print("DEFINITION OF DONE COMPLETE: source requirements and runtime evidence are satisfied.")
