#!/bin/bash
# VEX Cleanup Gate — runs BEFORE pre-work.sh
# Cleans stale state, old safety branches, and worktree residue from prior sessions
# Prevents contamination between night tasks

set -euo pipefail

REPO_DIR="/root/projects/VEX.RELEASE"
BRANCH="hermes-vex-work"
MAX_SAFETY_BRANCH_AGE_DAYS=1
STALE_RE='^pre-work-[0-9]{8}-[0-9]{6}$'

cd "$REPO_DIR"

echo "🧹 VEX Cleanup Gate"
echo "==================="

# 1. Verify branch
CURRENT=$(git branch --show-current 2>/dev/null || echo "")
if [ "$CURRENT" != "$BRANCH" ]; then
  echo "⚠️  Switching to $BRANCH (currently: ${CURRENT:-detached})"
  git checkout "$BRANCH" 2>/dev/null || git switch "$BRANCH" || true
fi

# 2. Fetch latest state of the branch
echo "📥 Fetching origin/$BRANCH..."
git fetch origin "$BRANCH" --quiet 2>/dev/null || true

# 3. Hard reset to clean remote state (no stashing, no merging)
echo "🔄 Resetting to origin/$BRANCH..."
git reset --hard "origin/$BRANCH" 2>/dev/null || git reset --hard HEAD
git clean -fd

# 4. Purge old safety branches (keep only today's)
echo "🗑️  Purging old safety branches..."
SAFETY_BRANCHES=$(git branch --list 'safety/pre-work-*' | sed 's/^[* ]*//')
TODAY=$(date +%Y%m%d)
for b in $SAFETY_BRANCHES; do
  bdate=$(echo "$b" | sed -n 's/^safety\/pre-work-\([0-9]\{8\}\).*/\1/p')
  if [ -n "$bdate" ] && [ "$bdate" != "$TODAY" ]; then
    echo "  🗑️  Deleting stale safety branch: $b"
    git branch -D "$b" 2>/dev/null || true
  fi
done

# 5. Clean work-state.json from prior interrupted sessions
if [ -f ".hermes/work-state.json" ]; then
  STARTED=$(grep -o '"started_at": "[^"]*"' .hermes/work-state.json | cut -d'"' -f4 || echo "")
  START_DATE=$(echo "$STARTED" | cut -d'T' -f1 | tr -d '-' || echo "")
  if [ -n "$START_DATE" ] && [ "$START_DATE" != "$TODAY" ]; then
    echo "🗑️  Removing stale work-state.json from $START_DATE"
    rm -f .hermes/work-state.json
    rm -f .hermes/work-state-changed.txt 2>/dev/null || true
  fi
fi

# 6. Verify clean
echo ""
echo "📊 Final worktree state:"
echo "  - Branch: $(git branch --show-current)"
echo "  - Head:  $(git rev-parse --short HEAD)"
echo "  - Status: $(git status --short | wc -l | tr -d ' ') changes"
echo ""
echo "✅ Cleanup gate complete — ready for pre-work.sh"
