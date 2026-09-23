from pathlib import Path
R=Path(__file__).resolve().parents[2]
for f in ["packages/platform-sdk/src/resilience.ts","config/dr.yaml","docs/runbooks/disaster-recovery.md","docs/reliability/failure-matrix.md"]: assert (R/f).exists(),f
s=(R/"packages/platform-sdk/src/resilience.ts").read_text(); assert "TransientDependencyError" in s and "CircuitBreaker" in s and "Math.random" in s
print("Section 23 static validation passed")
