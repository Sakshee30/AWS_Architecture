#!/usr/bin/env sh
set -eu

terraform fmt -check -recursive infrastructure/terraform
python -m pytest tests/architecture/validate_section17.py

if command -v docker >/dev/null 2>&1; then
  docker compose -f infrastructure/compose/compose.yaml --profile minimal config >/dev/null
  docker compose -f infrastructure/compose/compose.yaml --profile standard config >/dev/null
  docker compose -f infrastructure/compose/compose.yaml --profile full config >/dev/null
fi

if command -v kubectl >/dev/null 2>&1; then
  kubectl kustomize infrastructure/kubernetes/base >/dev/null
fi

if command -v kubeconform >/dev/null 2>&1; then
  kubectl kustomize infrastructure/kubernetes/base | kubeconform -strict -summary
fi
