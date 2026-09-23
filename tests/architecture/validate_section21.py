from pathlib import Path
R=Path(__file__).resolve().parents[2]
for p in [".github/workflows/pr-quality-security.yml",".github/workflows/build-release.yml",".github/workflows/promote.yml",".github/CODEOWNERS","docs/release/release-manifest.schema.json"]: assert (R/p).exists(),p
w="\n".join((R/p).read_text() for p in [".github/workflows/pr-quality-security.yml",".github/workflows/build-release.yml"])
for x in ["gitleaks","trivy","codeql","SBOM","attest"]: assert x.lower() in w.lower(),x
print("Section 21 static validation passed")
