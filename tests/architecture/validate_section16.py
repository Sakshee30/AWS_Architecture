from pathlib import Path
import re

ROOT=Path(__file__).resolve().parents[2]
DOMAIN_DIRS=[
    ROOT/"domain",
    ROOT/"application",
    ROOT/"packages"/"domain",
    ROOT/"packages"/"contracts",
    ROOT/"src"/"domain",
    ROOT/"src"/"application",
]
FORBIDDEN=(r"\bboto3\b",r"@aws-sdk/",r"aws-sdk",r"software\.amazon\.awssdk")

def test_domain_has_no_aws_sdk_imports():
    violations=[]
    for base in DOMAIN_DIRS:
        if not base.exists():
            continue
        for p in base.rglob("*"):
            if p.suffix not in {".py",".ts",".tsx",".js",".java",".kt"}:
                continue
            text=p.read_text(errors="ignore")
            if any(re.search(pattern,text) for pattern in FORBIDDEN):
                violations.append(str(p.relative_to(ROOT)))
    assert not violations, f"AWS SDK imports forbidden in domain/application: {violations}"

def test_secret_module_does_not_accept_secret_values():
    text=(ROOT/"infrastructure/terraform/modules/secrets/variables.tf").read_text()
    assert "secret_names" in text
    assert "secret_values" not in text
    assert "secret_string" not in text

def test_parameter_store_rejects_secret_like_names():
    text=(ROOT/"infrastructure/terraform/modules/parameter-store/variables.tf").read_text().lower()
    for marker in ("password","secret","token","private"):
        assert marker in text

def test_appconfig_is_configuration_only():
    text=(ROOT/"infrastructure/terraform/modules/appconfig/main.tf").read_text().lower()
    assert "aws_appconfig" in text
    assert "secretsmanager_secret_version" not in text

def test_secret_output_is_metadata_only():
    text=(ROOT/"infrastructure/terraform/modules/secrets/outputs.tf").read_text().lower()
    assert "secret_string" not in text
    assert "secret_binary" not in text
    assert "rotation_configured" in text
