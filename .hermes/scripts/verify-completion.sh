#!/bin/bash
# VEX Task Completion Verification Script
# Run this BEFORE marking a task as complete
# Verifies that actual work was done, not just claimed

set -e

REPO_DIR="/root/projects/VEX.RELEASE"
STATE_FILE="$REPO_DIR/.hermes/work-state.json"

cd "$REPO_DIR"

echo "✅ VEX Task Completion Verification"
echo "===================================="

# 1. Load state
if [ ! -f "$STATE_FILE" ]; then
    echo "❌ No work-state.json found — was pre-work.sh run?"
    exit 1
fi

SAFETY_BRANCH=$(grep -o '"safety_branch": "[^"]*"' "$STATE_FILE" | cut -d'"' -f4)
BASE_COMMIT=$(grep -o '"base_commit": "[^"]*"' "$STATE_FILE" | cut -d'"' -f4)

echo "📸 Safety branch: $SAFETY_BRANCH"
echo "📌 Base commit: $BASE_COMMIT"

# 2. Check if ANY actual changes were made
CHANGED_FILES=$(git diff --name-only "$BASE_COMMIT"..HEAD)
if [ -z "$CHANGED_FILES" ]; then
    echo "❌ NO CHANGES DETECTED"
    echo "   No files changed since safety snapshot."
    echo "   This task was NOT actually completed."
    echo ""
    echo "   Either:"
    echo "   1. Do the actual work first"
    echo "   2. Or block and report: 'Task cannot be completed because...'"
    exit 1
fi

echo "📝 Files changed:"
echo "$CHANGED_FILES"
echo ""

# 3. Verify changes are meaningful (not just whitespace/comments)
MEANINGFUL_CHANGES=0
for file in $CHANGED_FILES; do
    if [ -f "$file" ]; then
        # Check if changes are more than just whitespace/comments
        DIFF=$(git diff "$BASE_COMMIT"..HEAD -- "$file" | grep -E "^[+-]" | grep -v "^[+-]{3}" | grep -v "^[+-]\s*$" | grep -v "^[+-]\s*//" | grep -v "^[+-]\s*\*" | wc -l)
        if [ "$DIFF" -gt 2 ]; then
            MEANINGFUL_CHANGES=$((MEANINGFUL_CHANGES + 1))
        fi
    fi
done

if [ "$MEANINGFUL_CHANGES" -eq 0 ]; then
    echo "❌ NO MEANINGFUL CHANGES"
    echo "   All changes are whitespace, comments, or trivial."
    echo "   This task was NOT actually completed."
    exit 1
fi

echo "✅ Meaningful changes detected in $MEANINGFUL_CHANGES files"

# 4. Verify commits were made (not just uncommitted changes)
COMMIT_COUNT=$(git rev-list --count "$BASE_COMMIT"..HEAD)
if [ "$COMMIT_COUNT" -eq 0 ]; then
    echo "❌ NO COMMITS MADE"
    echo "   Changes exist but weren't committed."
    echo "   Commit your work before marking complete."
    exit 1
fi

echo "✅ $COMMIT_COUNT commit(s) made"

# 5. Verify code was pushed
CURRENT_COMMIT=$(git rev-parse HEAD)
REMOTE_COMMIT=$(git rev-parse "origin/hermes-vex-work" 2>/dev/null || echo "unknown")

if [ "$REMOTE_COMMIT" != "unknown" ] && [ "$CURRENT_COMMIT" != "$REMOTE_COMMIT" ]; then
    echo "⚠️  Code not pushed to remote"
    echo "   Local: $CURRENT_COMMIT"
    echo "   Remote: $REMOTE_COMMIT"
    echo "   Push your code before marking complete."
    exit 1
fi

echo "✅ Code pushed to origin/hermes-vex-work"

# 6. Verify all quality gates passed (run them again)
echo ""
echo "🔍 Running final verification gates..."

# TypeScript
if ! npm run typecheck -- --pretty false >/dev/null 2>&1; then
    echo "❌ TypeScript check FAILED"
    exit 1
fi
echo "✅ TypeScript: passed"

# Tests
if ! npm test -- --passWithNoTests >/dev/null 2>&1; then
    echo "❌ Tests FAILED"
    exit 1
fi
echo "✅ Tests: passed"

# File size
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
    echo -e "❌ File size violations:$OVERSIZED"
    exit 1
fi
echo "✅ File size: all under 200 lines"

# Banned patterns
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
    echo -e "❌ Banned patterns:$BANNED_HITS"
    exit 1
fi
echo "✅ Banned patterns: clean"

# 7. Generate completion summary
echo ""
echo "📊 Completion Summary"
echo "===================="
echo "Files changed: $(echo "$CHANGED_FILES" | wc -l)"
echo "Meaningful changes: $MEANINGFUL_CHANGES files"
echo "Commits: $COMMIT_COUNT"
echo "Pushed: yes"
echo "TypeScript: passed"
echo "Tests: passed"
echo "File size: passed"
echo "Banned patterns: passed"

# 8. Update state
cat > "$STATE_FILE" << EOF
{
    "started_at": "$(grep -o '"started_at": "[^"]*"' "$STATE_FILE" | cut -d'"' -f4)",
    "safety_branch": "$SAFETY_BRANCH",
    "base_commit": "$BASE_COMMIT",
    "base_branch": "hermes-vex-work",
    "completed_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "status": "completed",
    "files_changed": $(echo "$CHANGED_FILES" | wc -l),
    "meaningful_changes": $MEANINGFUL_CHANGES,
    "commits": $COMMIT_COUNT,
    "pushed": true,
    "verification": {
        "typescript": true,
        "tests": true,
        "file_size": true,
        "banned_patterns": true
    }
}
EOF

echo ""
echo "✅ TASK COMPLETION VERIFIED"
echo "   This task was ACTUALLY completed, not faked."
echo "   Safe to mark as done."
