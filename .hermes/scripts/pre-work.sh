#!/bin/bash
# VEX Pre-Work Safety Script
# Run this BEFORE starting any work on VEX
# Creates a safety snapshot you can rollback to if things go wrong

set -e

REPO_DIR="/root/projects/VEX.RELEASE"
BRANCH="hermes-vex-work"
SAFETY_BRANCH="safety/pre-work-$(date +%Y%m%d-%H%M%S)"

cd "$REPO_DIR"

echo "🔒 VEX Pre-Work Safety Check"
echo "=============================="

# 1. Ensure we're on the right branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "$BRANCH" ]; then
    echo "⚠️  Not on $BRANCH (currently on $CURRENT_BRANCH)"
    echo "🔄 Switching to $BRANCH..."
    git checkout "$BRANCH"
fi

# 2. Pull latest
echo "📥 Pulling latest from origin/$BRANCH..."
git pull origin "$BRANCH" || echo "⚠️  Pull failed — continuing with local state"

# 3. Check for uncommitted changes
if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "⚠️  Uncommitted changes detected!"
    echo "📝 Stashing changes..."
    git stash push -m "pre-work-stash-$(date +%Y%m%d-%H%M%S)"
    echo "💾 Changes stashed. Run 'git stash pop' to restore later."
fi

# 4. Create safety branch (snapshot of current state)
echo "📸 Creating safety branch: $SAFETY_BRANCH"
git branch "$SAFETY_BRANCH"
echo "✅ Safety branch created: $SAFETY_BRANCH"
echo "   To rollback: git checkout $SAFETY_BRANCH"

# 5. Log the state
STATE_FILE="$REPO_DIR/.hermes/work-state.json"
cat > "$STATE_FILE" << EOF
{
    "started_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "safety_branch": "$SAFETY_BRANCH",
    "base_commit": "$(git rev-parse HEAD)",
    "base_branch": "$BRANCH",
    "status": "in_progress"
}
EOF
echo "📊 State logged to .hermes/work-state.json"

# 6. Run baseline checks
echo ""
echo "🔍 Running baseline checks..."
echo "  - TypeScript: $(npm run typecheck -- --pretty false 2>&1 | tail -1)"
echo "  - Tests: $(npm test -- --passWithNoTests 2>&1 | tail -1)"

echo ""
echo "✅ Pre-work safety complete!"
echo "   Safety branch: $SAFETY_BRANCH"
echo "   Base commit: $(git rev-parse --short HEAD)"
echo ""
echo "🚀 Safe to start work. If anything goes wrong:"
echo "   bash .hermes/scripts/rollback.sh"
