#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
node "$REPO_ROOT/scripts/check-eas-production-secrets.js" "$@"
