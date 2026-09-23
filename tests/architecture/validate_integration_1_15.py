from pathlib import Path
R=Path(__file__).resolve().parents[2]
for f in ["packages/config-engine/src/index.ts","packages/config-engine/src/types.ts","packages/config-engine/src/validate.ts","packages/policy-engine/src/index.ts"]:
 assert (R/f).exists(),f
routes=(R/"apps/platform-control-api/src/section19/routes.ts").read_text()
assert "../../../../packages/config-engine/src/index.js" in routes
assert "../../../../packages/policy-engine/src/index.js" in routes
assert "validatePlatformState" in routes and "evaluatePlatformPolicy" in routes
print("Sections 16-30 integration shim with teammate 1-15 contracts present")
