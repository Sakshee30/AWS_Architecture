from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
s=(ROOT/"packages/security/src/section20.ts").read_text().lower()
for token in ("strict-transport-security","content-security-policy","verifySignedWebhook".lower(),"timingsafeequal","redactsensitive","https:"):
 assert token in s
w=(ROOT/"infrastructure/terraform/modules/waf/main.tf").read_text()
for token in ("AWSManagedRulesCommonRuleSet","AWSManagedRulesKnownBadInputsRuleSet","rate_based_statement"):
 assert token in w
assert (ROOT/"docs/security/section20-threat-model.md").exists()
assert (ROOT/".github/workflows/security-gates.yml").exists()
print("Section 20 static security validation passed")
