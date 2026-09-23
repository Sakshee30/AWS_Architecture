# Immutable image promotion

Section 17 requires the exact same application image digest to move through DEV -> TEST -> STAGING -> PROD without rebuilding per environment.

Use:

`scripts/promote-image-digest.sh <dev|test|staging|prod> repository@sha256:<digest>`

CI/deployment tooling must compare the digest being promoted with the digest from the previous environment before allowing promotion.
