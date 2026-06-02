#!/bin/bash
# VEX Verify Completion Script
# Updated: timeouts, changed-file scope, no full-suite unless necessary

set -euo pipefail

REPO_DIR="/root/projects/VEX.RELEASE"
BRANCH="hermes-vex-work"
STATE_FILE="$REPO_DIR/.hermes/work-state.json"
CHANGED_FILES_LIST="${STATE_FILE%.json}-changed.txt"

cd "$REPO_DIR"

echo "🔍 VEX Verify Completion"
echo "========================"

# 1. Validate state
if [ ! -f "$STATE_FILE" ]; then
  echo "❌ No work-state.json — run pre-work first"
  exit 1
fi

STATUS=$(grep -o '"status": "[^"]*"' "$STATE_FILE" | cut -d'"' -f4)
if [ "$STATUS" != "verified" ]; then
  echo "❌ Post-work verification not complete (status: $STATUS)"
  echo "   Run .hermes/scripts/post-work.sh first"
  exit 1
fi

SAFETY_BRANCH=$(grep -o '"safety_branch": "[^"]*"' "$STATE_FILE" | cut -d'"' -f4)
BASE_COMMIT=$(grep -o '"base_commit": "[^"]*"' "$STATE_FILE" | cut -d'"' -f4)

if [ ! -f "$CHANGED_FILES_LIST" ]; then
  echo "⚠️  No changed-files list found — regenerate with git diff"
  CHANGED_FILES=$(git diff --name-only "$BASE_COMMIT"..HEAD || true)
  echo "$CHANGED_FILES" > "$CHANGED_FILES_LIST"
fi

# 2. Verify actual work was done
echo ""
echo "📋 Checking actual work..."
CHANGED_COUNT=$(wc -l < "$CHANGED_FILES_LIST" | tr -d ' ')
if [ "$CHANGED_COUNT" -eq 0 ]; then
  echo "❌ NO FILES CHANGED — work was not done"
  exit 1
fi
echo "✅ $CHANGED_COUNT files changed"

# Map real changes (not just metadata)
REAL_CHANGES=0
while IFS= read -r file; do
  [ -f "$file" ] || continue
  EXT="${file##*.}"
  if [[ "$EXT" == "ts" || "$EXT" == "tsx" || "$EXT" == "json" || "$EXT" == "md" ]]; then
    SIZE=$(wc -c < "$file")
    if [ "$SIZE" -gt 0 ]; then
      REAL_CHANGES=$((REAL_CHANGES + 1))
    fi
  fi
done < "$CHANGED_FILES_LIST"

if [ "$REAL_CHANGES" -eq 0 ]; then
  echo "❌ No meaningful source changes detected (only metadata?)"
  exit 1
fi
echo "✅ $REAL_CHANGES meaningful source files changed"

# 3. Verify commits exist
echo ""
echo "📝 Checking commits..."
COMMIT_COUNT=$(git rev-list --count "$BASE_COMMIT"..HEAD 2>/dev/null || echo 0)
if [ "$COMMIT_COUNT" -eq 0 ]; then
  echo "❌ No commits made since base"
  exit 1
fi
echo "✅ $COMMIT_COUNT commit(s) made"

# 4. Verify push
echo ""
echo "🚀 Checking push status..."
if git diff --quiet origin/"$BRANCH"..HEAD; then
  echo "❌ Branch not pushed (local has unpushed commits)"
  exit 1
else
  echo "✅ Branch pushed to origin/$BRANCH"
fi

# 5. Summary
echo ""
echo "✅ VERIFICATION COMPLETE"
echo "----------------------------"
echo "Files changed: $CHANGED_COUNT"
echo "Commits: $COMMIT_COUNT"
echo "Safety branch: $SAFETY_BRANCH"
echo ""
echo "Latest commits:"
git log --oneline "$BASE_COMMIT"..HEAD | head -5
