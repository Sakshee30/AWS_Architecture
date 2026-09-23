from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
s=(ROOT/"packages/security/src/section20.ts").read_text().lower()
for token in ("strict-transport-security","content-security-policy","verifysignedwebhook","timingsafeequal","redactsensitive","https:","192\\.168","169\\.254","172\\."):
 assert token in s, token
field=(ROOT/"packages/security/src/field-encryption.ts").read_text().lower()
for token in ("aes-256-gcm","createdecipheriv","createcipheriv","getauthtag","datakeyprovider"):
 assert token in field, token
w=(ROOT/"infrastructure/terraform/modules/waf/main.tf").read_text()
for token in ("AWSManagedRulesCommonRuleSet","AWSManagedRulesKnownBadInputsRuleSet","rate_based_statement"):
 assert token in w
workflow=(ROOT/".github/workflows/security-gates.yml").read_text().lower()
for token in ("gitleaks","codeql","npm audit","scan-type: config","image-ref"):
 assert token in workflow, token
assert (ROOT/"docs/security/section20-threat-model.md").exists()
print("Section 20 static security validation passed")
