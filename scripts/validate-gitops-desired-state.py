#!/usr/bin/env python3
import json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
FLAGS=("enable_redis","enable_msk","enable_opensearch","enable_eks","enable_ecs","enable_gpu_nodes","enable_alb")
def tfvars(path):
 out={}
 for line in path.read_text().splitlines():
  m=re.match(r"^\s*(enable_[a-z_]+)\s*=\s*(true|false)\s*$",line)
  if m: out[m.group(1)]=m.group(2)=="true"
 return out
errors=[]
for env in ("dev","test","staging","prod"):
 desired_path=ROOT/"infrastructure"/"gitops"/"environments"/env/"desired-state.json"
 tf_path=ROOT/"infrastructure"/"terraform"/"environments"/env/"terraform.tfvars.example"
 if not desired_path.exists() or not tf_path.exists():
  errors.append(f"{env}: missing desired-state or terraform example");continue
 desired=json.loads(desired_path.read_text())
 if desired.get("environment")!=env: errors.append(f"{env}: environment mismatch")
 policy=desired.get("changePolicy",{})
 if policy.get("sourceOfTruth")!="git" or policy.get("directAwsMutationFromBrowser") is not False:
  errors.append(f"{env}: unsafe GitOps policy")
 actual=tfvars(tf_path); infra=desired.get("infrastructure",{})
 for flag in FLAGS:
  if flag not in infra: errors.append(f"{env}: desired state missing {flag}")
  elif flag not in actual: errors.append(f"{env}: terraform example missing {flag}")
  elif infra[flag] != actual[flag]: errors.append(f"{env}: {flag} differs desired={infra[flag]} terraform={actual[flag]}")
if errors:
 raise SystemExit("GitOps desired-state validation failed:\n- "+"\n- ".join(errors))
print("GitOps desired state matches Terraform environment examples")
