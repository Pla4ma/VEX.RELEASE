#!/usr/bin/env bash
# Verify eas.json has no placeholder values before submission
# Exit 1 if any "Set your" placeholder strings remain

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
EAS_FILE="$REPO_ROOT/eas.json"

if ! command -v jq &>/dev/null; then
  echo "⚠️  jq not installed — skipping eas.json placeholder check"
  exit 0
fi

PLACEHOLDER_COUNT=$(grep -c "Set your" "$EAS_FILE" 2>/dev/null || echo "0")

if [ "$PLACEHOLDER_COUNT" -gt 0 ]; then
  echo "❌ eas.json contains $PLACEHOLDER_COUNT placeholder value(s):"
  grep -n "Set your" "$EAS_FILE"
  echo ""
  echo "Run 'eas submit' will fail. Configure these values before App Store submission."
  exit 1
fi

echo "✅ eas.json: no placeholder values detected"
exit 0
