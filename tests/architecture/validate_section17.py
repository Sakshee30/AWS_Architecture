from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

def read(path: str) -> str:
    return (ROOT / path).read_text()

def test_kubernetes_security_and_probes():
    deployment = read("infrastructure/kubernetes/base/api-deployment.yaml")
    for required in [
        "runAsNonRoot: true",
        "readOnlyRootFilesystem: true",
        "allowPrivilegeEscalation: false",
        'drop: ["ALL"]',
        "startupProbe:",
        "readinessProbe:",
        "livenessProbe:",
        "resources:",
    ]:
        assert required in deployment

def test_liveness_does_not_reference_optional_dependencies():
    deployment = read("infrastructure/kubernetes/base/api-deployment.yaml").lower()
    live = deployment.split("livenessprobe:", 1)[1]
    for optional in ("redis", "kafka", "opensearch"):
        assert optional not in live

def test_hpa_keda_pdb_network_policy_exist():
    assert "HorizontalPodAutoscaler" in read("infrastructure/kubernetes/base/api-hpa.yaml")
    assert "ScaledObject" in read("infrastructure/kubernetes/base/worker-keda.yaml")
    assert "PodDisruptionBudget" in read("infrastructure/kubernetes/base/api-deployment.yaml")
    assert "NetworkPolicy" in read("infrastructure/kubernetes/base/networkpolicy.yaml")

def test_ecs_requires_immutable_digest():
    ecs = read("infrastructure/terraform/modules/ecs/main.tf")
    assert "@sha256:" in ecs
    assert "deployment_circuit_breaker" in ecs
    assert "rollback = true" in ecs

def test_compose_profiles_match_spec():
    compose = read("infrastructure/compose/compose.yaml")
    for profile in ('"minimal"', '"standard"', '"full"'):
        assert profile in compose
    for service in ("postgres:", "api:", "web:", "redis:", "localstack:", "worker:", "kafka:"):
        assert service in compose
