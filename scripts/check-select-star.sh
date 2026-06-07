#!/bin/bash
# check-select-star.sh — Enforce zero tolerance for SELECT * in repository files
# Exits 0 if clean, 1 if violations found

set -euo pipefail

VIOLATIONS=$(grep -rn "select(\"\*\")" src/features/ --include="*.ts" --include="*.tsx" 2>/dev/null || true)
VIOLATIONS_SUPABASE=$(grep -rn "select\(\"\*\"\)" src/features/ --include="*.ts" --include="*.tsx" 2>/dev/null || true)

COUNT=0
if [ -n "$VIOLATIONS" ]; then
  COUNT=$(echo "$VIOLATIONS" | wc -l)
  echo "ERROR: Found $COUNT select(*) violations:"
  echo "$VIOLATIONS"
fi

if [ "$COUNT" -gt 0 ]; then
  exit 1
fi

echo "OK: No select(*) violations found."
exit 0
