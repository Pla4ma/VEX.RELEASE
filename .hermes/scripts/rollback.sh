#!/bin/bash
# VEX Rollback Script
# Updated: faster, clearer, always use --yes flag to prevent accidental rolls

set -euo pipefail

REPO_DIR="/root/projects/VEX.RELEASE"
BRANCH="hermes-vex-work"
STATE_FILE="$REPO_DIR/.hermes/work-state.json"

cd "$REPO_DIR"

FORCE=""
if [ "${1:-}" = "--yes" ]; then
  FORCE="yes"
fi

if [ -z "$FORCE" ]; then
  echo "⚠️  This will RESET all work back to the safety snapshot."
  echo "   All uncommitted and committed changes after pre-work will be LOST."
  read -p "Type 'ROLLBACK' to confirm: " CONFIRM
  if [ "$CONFIRM" != "ROLLBACK" ]; then
    echo "❌ Rollback cancelled"
    exit 1
  fi
fi

# Load state
if [ ! -f "$STATE_FILE" ]; then
  echo "❌ No work-state.json found"
  exit 1
fi

SAFETY_BRANCH=$(grep -o '"safety_branch": "[^"]*"' "$STATE_FILE" | cut -d'"' -f4)
BASE_COMMIT=$(grep -o '"base_commit": "[^"]*"' "$STATE_FILE" | cut -d'"' -f4)

echo "🔄 Rolling back to: $SAFETY_BRANCH"

# Hard reset and clean
git reset --hard "$SAFETY_BRANCH" 2>/dev/null || git reset --hard "$BASE_COMMIT"
git clean -fd

# Delete any new untracked files from the work session
git clean -fd src/ || true

echo "✅ Rollback complete — worktree restored to $SAFETY_BRANCH"
echo "   Commit: $(git rev-parse --short HEAD)"
echo "   Branch: $(git branch --show-current)"

# Update state
cat > "$STATE_FILE" << EOF
{
  "started_at": "$(grep -o '"started_at": "[^"]*"' "$STATE_FILE" | cut -d'"' -f4)",
  "safety_branch": "$SAFETY_BRANCH",
  "base_commit": "$(git rev-parse HEAD)",
  "base_branch": "$BRANCH",
  "status": "rolled_back",
  "rolled_back_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF

echo ""
echo "📊 State updated: rolled_back"
echo "   Ready to restart: bash .hermes/scripts/pre-work.sh"
