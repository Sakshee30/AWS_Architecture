from pathlib import Path
R=Path(__file__).resolve().parents[2]
required=[
 "packages/config-engine/src/index.ts",
 "packages/config-engine/src/types.ts",
 "packages/config-engine/src/validate.ts",
 "packages/config-engine/src/validate-all.ts",
 "packages/config-engine/src/workflows.ts",
 "packages/policy-engine/src/index.ts",
]
for f in required: assert (R/f).exists(),f
routes=(R/"apps/platform-control-api/src/section19/routes.ts").read_text()
assert "../../../../packages/config-engine/src/index.js" in routes
assert "../../../../packages/policy-engine/src/index.js" in routes
for token in ["validatePlatformState","evaluatePlatformPolicy","/platform/changes/:id/status"]:
 assert token in routes,token
workflows=(R/"packages/config-engine/src/workflows.ts").read_text()
for token in ["redis-off","kafka-off","opensearch-off","eks-to-ecs","ai-off","5%","25%","50%","100%"]:
 assert token in workflows,token
print("Sections 16-30 alignment with teammate 1-15 config/policy/workflow contracts passed")
