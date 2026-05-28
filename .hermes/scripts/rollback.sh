#!/bin/bash
# VEX Rollback Script
# Use this to revert to the last known good state
# Run from the VEX repo directory

set -e

REPO_DIR="/root/projects/VEX.RELEASE"
BRANCH="hermes-vex-work"
STATE_FILE="$REPO_DIR/.hermes/work-state.json"

cd "$REPO_DIR"

echo "🔄 VEX Rollback"
echo "==============="

# 1. Check for state file
if [ ! -f "$STATE_FILE" ]; then
    echo "❌ No work-state.json found"
    echo "   Looking for safety branches..."
    SAFETY_BRANCHES=$(git branch | grep "safety/pre-work-" | head -5)
    if [ -n "$SAFETY_BRANCHES" ]; then
        echo "   Found safety branches:"
        echo "$SAFETY_BRANCHES"
        echo ""
        echo "   To rollback to a specific one:"
        echo "   git checkout <branch-name>"
        echo "   git checkout $BRANCH"
        echo "   git reset --hard <branch-name>"
    else
        echo "   No safety branches found."
        echo "   Manual recovery needed. Check git reflog:"
        echo "   git reflog | head -20"
    fi
    exit 1
fi

# 2. Load state
SAFETY_BRANCH=$(grep -o '"safety_branch": "[^"]*"' "$STATE_FILE" | cut -d'"' -f4)
BASE_COMMIT=$(grep -o '"base_commit": "[^"]*"' "$STATE_FILE" | cut -d'"' -f4)
STATUS=$(grep -o '"status": "[^"]*"' "$STATE_FILE" | cut -d'"' -f4)

echo "📊 Current state:"
echo "   Status: $STATUS"
echo "   Safety branch: $SAFETY_BRANCH"
echo "   Base commit: $BASE_COMMIT"

# 3. Check if safety branch exists
if ! git rev-parse --verify "$SAFETY_BRANCH" >/dev/null 2>&1; then
    echo "❌ Safety branch $SAFETY_BRANCH not found!"
    echo "   Manual recovery needed. Check git reflog:"
    echo "   git reflog | head -20"
    exit 1
fi

# 4. Show what will be lost
echo ""
echo "📝 Changes since safety snapshot:"
git diff --stat "$SAFETY_BRANCH"..HEAD

echo ""
echo "⚠️  This will revert ALL changes since the safety snapshot."
echo "   Safety branch: $SAFETY_BRANCH"
echo "   Current HEAD: $(git rev-parse --short HEAD)"

# 5. Confirm (skip if --yes flag passed)
if [ "$1" != "--yes" ]; then
    read -p "   Continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "   Cancelled."
        exit 0
    fi
fi

# 6. Rollback
echo ""
echo "🔄 Rolling back..."
git checkout "$BRANCH"
git reset --hard "$SAFETY_BRANCH"
    git clean -fd  # Remove untracked files
echo "✅ Rolled back to $SAFETY_BRANCH"
echo "   Current commit: $(git rev-parse --short HEAD)"

# 7. Update state
cat > "$STATE_FILE" << EOF
{
    "rolled_back_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "safety_branch": "$SAFETY_BRANCH",
    "base_commit": "$BASE_COMMIT",
    "base_branch": "$BRANCH",
    "status": "rolled_back"
}
EOF

echo ""
echo "✅ Rollback complete!"
echo "   You're back to the state before work started."
echo "   Safety branch preserved: $SAFETY_BRANCH"
