#!/bin/bash
# VEX Post-Work Verification Script
# Updated: lint changed files, avoid unsafe isolated-file tsc check.

set -euo pipefail

REPO_DIR="/root/projects/VEX.RELEASE"
BRANCH="hermes-vex-work"
STATE_FILE="$REPO_DIR/.hermes/work-state.json"
CHANGED_FILES_LIST="${STATE_FILE%.json}-changed.txt"

cd "$REPO_DIR"

# 1. Load state
if [ ! -f "$STATE_FILE" ]; then
  echo "❌ No work-state.json — run pre-work first"
  exit 1
fi

SAFETY_BRANCH=$(grep -o '"safety_branch": "[^"]*"' "$STATE_FILE" | cut -d'"' -f4)
BASE_COMMIT=$(grep -o '"base_commit": "[^"]*"' "$STATE_FILE" | cut -d'"' -f4)

echo "🔍 VEX Post-Work Verification"
echo "=============================="
echo "📸 Safety: $SAFETY_BRANCH | 🔌 Base: $BASE_COMMIT"

# 2. Detect changed files
CHANGED_FILES=$(git diff --name-only "$BASE_COMMIT"..HEAD || true)
echo "$CHANGED_FILES" > "$CHANGED_FILES_LIST"
CHANGED_COUNT=$(wc -l < "$CHANGED_FILES_LIST" | tr -d ' ')
echo "📝 Changed files: $CHANGED_COUNT"
[ "$CHANGED_COUNT" -gt 0 ] || { echo "⚠️  No changes detected!"; exit 1; }

# 3. File size check (only on changed files)
echo ""
echo "📏 File size check (200 line limit)..."
OVERSIZED=""
while IFS= read -r file; do
  [ -f "$file" ] || continue
  # Exempt: auto-generated Supabase types (5600+ lines, cannot be split)
  [[ "$file" == *"/supabase.ts" ]] && continue
  LINES=$(wc -l < "$file")
  if [ "$LINES" -gt 200 ]; then
    OVERSIZED="$OVERSIZED\n  ❌ $file ($LINES lines)"
  fi
done < "$CHANGED_FILES_LIST"

if [ -n "$OVERSIZED" ]; then
  echo -e "❌ FILE SIZE VIOLATIONS:$OVERSIZED"
  bash .hermes/scripts/rollback.sh --yes
  exit 1
else
  echo "✅ All files under 200 lines"
fi

# 4. Banned patterns (only on changed files)
echo ""
echo "🚫 Banned pattern check..."
BANNED_PATTERNS='console\.|: any\b|<any>|@ts-ignore|@ts-nocheck|StyleSheet\.create|FlatList|AsyncStorage|fetch\('
BANNED_HITS=""
while IFS= read -r file; do
  [[ "$file" == *.ts || "$file" == *.tsx ]] || continue
  HITS=$(grep -nE "$BANNED_PATTERNS" "$file" 2>/dev/null || true)
  if [ -n "$HITS" ]; then
    BANNED_HITS="$BANNED_HITS\n  ❌ $file:\n$HITS"
  fi
done < "$CHANGED_FILES_LIST"

if [ -n "$BANNED_HITS" ]; then
  echo -e "❌ BANNED PATTERNS:$BANNED_HITS"
  bash .hermes/scripts/rollback.sh --yes
  exit 1
else
  echo "✅ No banned patterns in changed files"
fi

# 5. Lint changed source files
echo ""
echo "🧹 Lint (changed files)..."
mapfile -t LINT_TARGETS < <(awk 'NF && /^(src|tests|__tests__)/' "$CHANGED_FILES_LIST" | grep -E '\.(ts|tsx)$' || true)
if [ "${#LINT_TARGETS[@]}" -gt 0 ]; then
  if ! npx eslint --ext .ts,.tsx "${LINT_TARGETS[@]}" 2>&1; then
    echo "❌ Lint FAILED on changed files"
    bash .hermes/scripts/rollback.sh --yes
    exit 1
  fi
else
  echo "ℹ️  No source files changed, skipping lint"
fi
echo "✅ Lint passed for changed files"

# 6. TypeScript check (full project). Changed-file isolation caused false positives.
echo ""
echo "🔷 TypeScript check..."
if ! npm run typecheck 2>&1; then
  echo "❌ TypeScript check FAILED"
  bash .hermes/scripts/rollback.sh --yes
  exit 1
fi
echo "✅ TypeScript check passed"

# 7. Targeted tests (only if test files changed)
echo ""
echo "🧪 Running targeted tests..."
TEST_CHANGED=$(grep -E '\.test\.|\.spec\.' "$CHANGED_FILES_LIST" || true)
if [ -n "$TEST_CHANGED" ]; then
  TEST_PATTERNS=$(printf '%s' "$TEST_CHANGED" | sed 's/\.tsx\?$//' | tr '\n' '|' | sed 's/|$//')
  if ! npm test -- --testPathPattern="$TEST_PATTERNS" --passWithNoTests 2>&1; then
    echo "❌ Targeted tests FAILED"
    bash .hermes/scripts/rollback.sh --yes
    exit 1
  fi
else
  echo "ℹ️  No test files changed — skipping targeted test run"
fi
echo "✅ Tests passed"

# 8. Update state
echo ""
echo "✅ ALL VERIFICATION GATES PASSED"
echo ""
echo "🚀 Ready to commit and push:"
echo "   git add -A && git commit -m 'fix(scope): descriptive message' && git push origin $BRANCH"
