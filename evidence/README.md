# Production readiness evidence
Do not commit secrets. CI/staging/prod runs create production-readiness.json with one object per checklist key containing passed=true and an evidence artifact/run/reference. Missing evidence intentionally fails the readiness script.
