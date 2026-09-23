from pathlib import Path
R=Path(__file__).resolve().parents[2]
files=[
 ".github/workflows/pr-quality-security.yml",
 ".github/workflows/build-release.yml",
 ".github/workflows/promote.yml",
 ".github/workflows/quality-matrix.yml",
 ".github/workflows/release-policy.yml",
 ".github/CODEOWNERS",
 "docs/release/release-manifest.schema.json",
 "CHANGELOG.md",
]
for p in files: assert (R/p).exists(),p
allw="\n".join((R/p).read_text() for p in files if p.endswith(".yml"))
for token in ["format:check","lint","typecheck","gitleaks","codeql","npm audit","license","scan-type: config","docker build","SBOM","attest","test:e2e","test:dast","test:performance","test:load","test:migration","test:production-health"]:
 assert token.lower() in allw.lower(),token
promote=(R/".github/workflows/promote.yml").read_text()
for token in ["image_digest","config_version","migration_version","deployment_execution","release-manifest.json"]:
 assert token in promote,token
release=(R/"docs/release/release-manifest.schema.json").read_text()
for token in ["gitCommit","imageDigest","sbom","configVersion","migrationVersion","deploymentExecution"]:
 assert token in release,token
print("Section 21 static validation passed")
