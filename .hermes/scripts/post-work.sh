#!/bin/bash
# VEX Post-Work Verification Script
# Run this AFTER completing work on VEX
# Runs ALL quality gates — auto-reverts if ANY fail

set -e

REPO_DIR="/root/projects/VEX.RELEASE"
BRANCH="hermes-vex-work"
STATE_FILE="$REPO_DIR/.hermes/work-state.json"

cd "$REPO_DIR"

echo "🔍 VEX Post-Work Verification"
echo "=============================="

# 1. Load safety branch from state
if [ ! -f "$STATE_FILE" ]; then
    echo "❌ No work-state.json found — was pre-work.sh run?"
    exit 1
fi

SAFETY_BRANCH=$(grep -o '"safety_branch": "[^"]*"' "$STATE_FILE" | cut -d'"' -f4)
BASE_COMMIT=$(grep -o '"base_commit": "[^"]*"' "$STATE_FILE" | cut -d'"' -f4)

echo "📸 Safety branch: $SAFETY_BRANCH"
echo "📌 Base commit: $BASE_COMMIT"

# 2. Track changes
CHANGED_FILES=$(git diff --name-only "$BASE_COMMIT"..HEAD)
echo ""
echo "📝 Changed files:"
echo "$CHANGED_FILES" | head -20
if [ $(echo "$CHANGED_FILES" | wc -l) -gt 20 ]; then
    echo "  ... and $(( $(echo "$CHANGED_FILES" | wc -l) - 20 )) more"
fi

# 3. File size check
echo ""
echo "📏 File size check (200 line limit)..."
OVERSIZED=""
for file in $CHANGED_FILES; do
    if [ -f "$file" ]; then
        LINES=$(wc -l < "$file")
        if [ "$LINES" -gt 200 ]; then
            OVERSIZED="$OVERSIZED\n  ❌ $file ($LINES lines)"
        fi
    fi
done
if [ -n "$OVERSIZED" ]; then
    echo "❌ FILE SIZE VIOLATIONS:"
    echo -e "$OVERSIZED"
    echo ""
    echo "🔄 AUTO-REVERTING to safety branch..."
    git checkout "$SAFETY_BRANCH"
    git checkout "$BRANCH"
    git reset --hard "$SAFETY_BRANCH"
    git clean -fd  # Remove untracked files
    git clean -fd  # Remove untracked files
    echo "✅ Reverted to $SAFETY_BRANCH"
    echo "   The oversized files need to be split before proceeding."
    exit 1
else
    echo "✅ All files under 200 lines"
fi

# 4. Banned pattern check
echo ""
echo "🚫 Banned pattern check..."
BANNED_PATTERNS="console\.|: any\b|<any>|@ts-ignore|@ts-nocheck|StyleSheet\.create|FlatList|AsyncStorage|fetch\("
BANNED_HITS=""
for file in $CHANGED_FILES; do
    if [[ "$file" == *.ts || "$file" == *.tsx ]]; then
        HITS=$(grep -nE "$BANNED_PATTERNS" "$file" 2>/dev/null || true)
        if [ -n "$HITS" ]; then
            BANNED_HITS="$BANNED_HITS\n  ❌ $file:\n$HITS"
        fi
    fi
done
if [ -n "$BANNED_HITS" ]; then
    echo "❌ BANNED PATTERNS FOUND:"
    echo -e "$BANNED_HITS"
    echo ""
    echo "🔄 AUTO-REVERTING to safety branch..."
    git checkout "$SAFETY_BRANCH"
    git checkout "$BRANCH"
    git reset --hard "$SAFETY_BRANCH"
    git clean -fd  # Remove untracked files
    echo "✅ Reverted to $SAFETY_BRANCH"
    echo "   Fix the banned patterns before proceeding."
    exit 1
else
    echo "✅ No banned patterns found"
fi

# 5. TypeScript check
echo ""
echo "🔷 TypeScript check..."
if npm run typecheck -- --pretty false 2>&1; then
    echo "✅ TypeScript check passed"
else
    echo "❌ TypeScript check FAILED"
    echo ""
    echo "🔄 AUTO-REVERTING to safety branch..."
    git checkout "$SAFETY_BRANCH"
    git checkout "$BRANCH"
    git reset --hard "$SAFETY_BRANCH"
    git clean -fd  # Remove untracked files
    echo "✅ Reverted to $SAFETY_BRANCH"
    echo "   Fix TypeScript errors before proceeding."
    exit 1
fi

# 6. Test check
echo ""
echo "🧪 Running tests..."
if npm test -- --passWithNoTests 2>&1; then
    echo "✅ Tests passed"
else
    echo "❌ Tests FAILED"
    echo ""
    echo "🔄 AUTO-REVERTING to safety branch..."
    git checkout "$SAFETY_BRANCH"
    git checkout "$BRANCH"
    git reset --hard "$SAFETY_BRANCH"
    git clean -fd  # Remove untracked files
    echo "✅ Reverted to $SAFETY_BRANCH"
    echo "   Fix failing tests before proceeding."
    exit 1
fi

# 7. All gates passed — update state
echo ""
echo "✅ ALL VERIFICATION GATES PASSED"
echo ""

cat > "$STATE_FILE" << EOF
{
    "started_at": "$(grep -o '"started_at": "[^"]*"' "$STATE_FILE" | cut -d'"' -f4)",
    "safety_branch": "$SAFETY_BRANCH",
    "base_commit": "$BASE_COMMIT",
    "base_branch": "$BRANCH",
    "completed_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "status": "verified",
    "changed_files": $(echo "$CHANGED_FILES" | jq -R -s 'split("\n") | map(select(. != ""))')
}
EOF

echo "📊 State updated: verified"
echo ""
echo "🚀 Ready to commit and push!"
echo "   git add -A && git commit -m 'your message' && git push origin $BRANCH"
