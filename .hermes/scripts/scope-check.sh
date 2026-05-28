#!/bin/bash
# VEX Scope Check Script
# Verifies that files being edited are in scope of the task
# Prevents accidentally touching unrelated files

set -e

REPO_DIR="/root/projects/VEX.RELEASE"
STATE_FILE="$REPO_DIR/.hermes/work-state.json"

cd "$REPO_DIR"

echo "🎯 VEX Scope Check"
echo "=================="

# 1. Get changed files
if [ -f "$STATE_FILE" ]; then
    BASE_COMMIT=$(grep -o '"base_commit": "[^"]*"' "$STATE_FILE" | cut -d'"' -f4)
    CHANGED_FILES=$(git diff --name-only "$BASE_COMMIT"..HEAD)
else
    echo "⚠️  No work-state.json — checking all uncommitted changes"
    CHANGED_FILES=$(git diff --name-only HEAD)
fi

if [ -z "$CHANGED_FILES" ]; then
    echo "✅ No files changed"
    exit 0
fi

echo "📝 Changed files:"
echo "$CHANGED_FILES"

# 2. Check for suspicious patterns
echo ""
echo "🔍 Checking for suspicious changes..."

ISSUES=""

# Check for changes outside src/
OUTSIDE_SRC=$(echo "$CHANGED_FILES" | grep -v "^src/" | grep -v "^\.hermes/" | grep -v "^docs/" || true)
if [ -n "$OUTSIDE_SRC" ]; then
    ISSUES="$ISSUES\n⚠️  Changes outside src/ directory:\n$OUTSIDE_SRC"
fi

# Check for changes to config files
CONFIG_CHANGES=$(echo "$CHANGED_FILES" | grep -E "(package\.json|tsconfig|babel|jest|metro)" || true)
if [ -n "$CONFIG_CHANGES" ]; then
    ISSUES="$ISSUES\n⚠️  Config file changes (review carefully):\n$CONFIG_CHANGES"
fi

# Check for changes to test files
TEST_CHANGES=$(echo "$CHANGED_FILES" | grep -E "(__tests__|\.test\.|\.spec\.)" || true)
if [ -n "$TEST_CHANGES" ]; then
    echo "✅ Test files changed (good):"
    echo "$TEST_CHANGES"
fi

# 3. Report
if [ -n "$ISSUES" ]; then
    echo ""
    echo "⚠️  POTENTIAL SCOPE ISSUES:"
    echo -e "$ISSUES"
    echo ""
    echo "   Review these carefully — are they intentional?"
    echo "   If not, revert with: git checkout HEAD -- <file>"
else
    echo ""
    echo "✅ All changes appear to be in scope"
fi

# 4. Summary
echo ""
echo "📊 Summary:"
echo "   Total files changed: $(echo "$CHANGED_FILES" | wc -l)"
echo "   In src/: $(echo "$CHANGED_FILES" | grep -c "^src/" || echo 0)"
echo "   Tests: $(echo "$CHANGED_FILES" | grep -cE "(__tests__|\.test\.|\.spec\.)" || echo 0)"
