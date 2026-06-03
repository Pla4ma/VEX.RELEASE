#!/usr/bin/env bash
# Verify eas.json has no placeholder values before submission
# Checks for "Set your" placeholders AND "path/to/" stubs
# Also warns (non-fatal) if env var references are still unresolved locally

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
EAS_FILE="$REPO_ROOT/eas.json"

if [ ! -f "$EAS_FILE" ]; then
  echo "⚠️  eas.json not found — skipping check"
  exit 0
fi

ERRORS=0

# --- Hard placeholders that MUST NOT ship ---
PLACEHOLDER_SET_YOUR=$(grep -c "Set your" "$EAS_FILE" 2>/dev/null || true)
PLACEHOLDER_SET_YOUR=${PLACEHOLDER_SET_YOUR:-0}
if [ "$PLACEHOLDER_SET_YOUR" -gt 0 ]; then
  echo "❌ eas.json contains $PLACEHOLDER_SET_YOUR 'Set your' placeholder(s):"
  grep -n "Set your" "$EAS_FILE"
  ERRORS=$((ERRORS + 1))
fi

PLACEHOLDER_PATH_TO=$(grep -c "path/to/" "$EAS_FILE" 2>/dev/null || true)
PLACEHOLDER_PATH_TO=${PLACEHOLDER_PATH_TO:-0}
if [ "$PLACEHOLDER_PATH_TO" -gt 0 ]; then
  echo "❌ eas.json contains $PLACEHOLDER_PATH_TO 'path/to/' placeholder(s):"
  grep -n "path/to/" "$EAS_FILE"
  ERRORS=$((ERRORS + 1))
fi

if [ "$ERRORS" -gt 0 ]; then
  echo ""
  echo "❌ eas.json has hardcoded placeholders — 'eas submit' will fail."
  echo "   Set EAS secrets (eas secret:create) or export env vars before submitting."
  exit 1
fi

# --- Env var references (informational, not fatal) ---
ENV_VAR_COUNT=$(grep -c '\${' "$EAS_FILE" 2>/dev/null || echo "0")
if [ "$ENV_VAR_COUNT" -gt 0 ]; then
  echo "ℹ️  eas.json uses $ENV_VAR_COUNT env var reference(s) — ensure EAS secrets are set:"
  grep -no '\${[A-Z_]*}' "$EAS_FILE" | while read -r line; do
    echo "   $line"
  done
  echo "   Set via: eas secret:create --scope project --name <VAR> --value <VALUE>"
fi

echo "✅ eas.json: no hardcoded placeholder values detected"
exit 0
