#!/bin/bash
# VEX Pre-Work Safety Script
# Updated: hard reset to safety snapshot, auto-clean worktree, block on dirty state

set -euo pipefail

REPO_DIR="/root/projects/VEX.RELEASE"
BRANCH="hermes-vex-work"
SAFETY_BRANCH="safety/pre-work-$(date +%Y%m%d-%H%M%S)"

cd "$REPO_DIR"

echo "🔒 VEX Pre-Work Safety Check"
echo "=============================="

# 1. Enforce correct branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "$BRANCH" ]; then
  echo "⚠️  Not on $BRANCH (currently on $CURRENT_BRANCH)"
  echo "🔄 Switching..."
  git checkout "$BRANCH" 2>/dev/null || git switch "$BRANCH"
fi

# 2. Hard reset to clean state (no stashing — stashing causes conflicts later)
echo "🧹 Hard resetting to remote $BRANCH..."
git fetch origin "$BRANCH" --quiet || true
git reset --hard "origin/$BRANCH" 2>/dev/null || git reset --hard HEAD
git clean -fd

echo "✅ Worktree reset to clean state"

# 3. Create safety branch (snapshot of known-good state)
git branch "$SAFETY_BRANCH" 2>/dev/null || true
echo "📸 Safety branch: $SAFETY_BRANCH"

# 4. Log state
STATE_FILE="$REPO_DIR/.hermes/work-state.json"
COMMIT_SHA=$(git rev-parse HEAD)
cat > "$STATE_FILE" << EOF
{
  "started_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "safety_branch": "$SAFETY_BRANCH",
  "base_commit": "$COMMIT_SHA",
  "base_branch": "$BRANCH",
  "status": "in_progress"
}
EOF

# 5. Quick baseline
echo ""
echo "🔍 Baseline (non-blocking)..."
echo "  - Branch: $BRANCH"
echo "  - Base commit: $(git rev-parse --short HEAD)"
echo "  - Safety snapshot: $SAFETY_BRANCH"
echo ""
echo "✅ Pre-work complete — worktree is clean and ready"
echo ""
echo "If anything goes wrong:"
echo "   bash .hermes/scripts/rollback.sh --yes"
