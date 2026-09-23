#!/usr/bin/env sh
set -eu

if [ "$#" -ne 2 ]; then
  echo "usage: $0 <environment> <repository@sha256:digest>" >&2
  exit 2
fi

environment="$1"
image="$2"

case "$environment" in
  dev|test|staging|prod) ;;
  *) echo "invalid environment: $environment" >&2; exit 2 ;;
esac

case "$image" in
  *@sha256:????????????????????????????????????????????????????????????????) ;;
  *) echo "image must be pinned by immutable sha256 digest" >&2; exit 2 ;;
esac

mkdir -p "infrastructure/image-promotions/$environment"
printf "%s\n" "$image" > "infrastructure/image-promotions/$environment/image.txt"
echo "recorded immutable image for $environment: $image"
