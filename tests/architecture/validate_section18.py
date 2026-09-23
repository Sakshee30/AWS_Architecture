from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[2]
TF = ROOT / "infrastructure" / "terraform"
required_modules = {"vpc","alb","ecs","eks","rds","redis","s3","sqs","kafka","opensearch","iam","secrets","monitoring","cloudfront","vpc-endpoints"}
modules = {p.name for p in (TF / "modules").iterdir() if p.is_dir()}
missing = required_modules - modules
assert not missing, f"Missing Section 18 Terraform modules: {sorted(missing)}"

for env in ("dev","test","staging","prod"):
    p = TF / "environments" / env
    assert (p / "main.tf").exists(), f"Missing {env}/main.tf"
    assert (p / "variables.tf").exists(), f"Missing {env}/variables.tf"
    text = (p / "variables.tf").read_text()
    for flag in ("enable_redis","enable_msk","enable_opensearch","enable_eks","enable_gpu_nodes"):
        assert flag in text, f"{env} missing explicit {flag}"
    desired = ROOT / "infrastructure" / "gitops" / "environments" / env / "desired-state.json"
    assert desired.exists(), f"Missing GitOps desired state for {env}"
    state = json.loads(desired.read_text())
    assert state["environment"] == env
    assert state["changePolicy"]["sourceOfTruth"] == "git"
    assert state["changePolicy"]["directAwsMutationFromBrowser"] is False

gitops = (ROOT / "infrastructure/gitops/README.md").read_text()
for gate in ("Terraform plan","approval","health","rollback"):
    assert gate.lower() in gitops.lower(), f"GitOps flow missing {gate}"

asl_path = ROOT / "infrastructure/step-functions/change-orchestrator.asl.json"
asl = json.loads(asl_path.read_text())
for state in ("ValidateChange","ImpactAnalysis","ApplyAppConfig","RunTerraformPlan","ApplyInfrastructure","SmokeTests","CloudWatchHealthGate","Rollback"):
    assert state in asl["States"], f"orchestrator missing {state}"

platform = (TF / "modules/platform-environment/main.tf").read_text()
for flag in ("enable_redis","enable_msk","enable_opensearch","enable_eks","enable_gpu_nodes"):
    assert f"var.{flag}" in platform, f"desired state not wired for {flag}"
for module in ("../cloudfront","../vpc-endpoints","../waf"):
    assert module in platform, f"platform environment missing {module}"

print("Section 18 static architecture validation passed")
