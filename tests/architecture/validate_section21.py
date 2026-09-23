from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
w=(ROOT/".github/workflows/release-engineering.yml").read_text()
for x in ("pull_request","SBOM","Vulnerability gate","production","release-evidence"):
 assert x.lower() in w.lower()
assert (ROOT/".github/CODEOWNERS").exists()
p=(ROOT/"docs/release/section21-release-policy.md").read_text()
for x in ("same image digest","no direct pushes","Git commit","configuration version","migration version","rollback"):
 assert x.lower() in p.lower()
print("Section 21 static release validation passed")
