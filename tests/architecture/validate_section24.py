from pathlib import Path
R=Path(__file__).resolve().parents[2]
for f in ["config/limits.yaml","infrastructure/terraform/modules/finops/main.tf","packages/platform-sdk/src/cost-impact.ts","docs/performance/test-plan.md"]: assert (R/f).exists(),f
assert "advisory" in (R/"packages/platform-sdk/src/cost-impact.ts").read_text()
print("Section 24 static validation passed")
