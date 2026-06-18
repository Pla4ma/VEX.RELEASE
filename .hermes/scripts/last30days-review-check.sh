#!/bin/bash
# last30days-review-check.sh — Pre-PR community intelligence
# Run before merging changes to specific areas

set -euo pipefail

AREA="${1:?Usage: $0 <area> (e.g., navigation, storage, animation, list, build)}"
PYTHON="python3.12"
ENGINE="$HOME/.agents/skills/last30days/scripts/last30days.py"

# Map VEX areas to last30days queries
declare -A AREA_QUERIES=(
    ["navigation"]="expo-router nested navigation memory leak 2026"
    ["storage"]="MMKV corruption React Native 2026"
    ["animation"]="Reanimated 4 performance issues 2026"
    ["list"]="FlashList v2 migration gotchas 2026"
    ["build"]="EAS Build cache invalidation issues 2026"
    ["state"]="Zustand vs Jotai React Native 2026"
    ["architecture"]="Expo React Native architecture 2026"
    ["testing"]="React Native testing library 2026"
)

QUERY="${AREA_QUERIES[$AREA]:-}"

if [ -z "$QUERY" ]; then
    echo "Unknown area: $AREA"
    echo "Available areas: ${!AREA_QUERIES[*]}"
    exit 1
fi

echo "🔍 Checking community for: $QUERY"
echo ""

OUTPUT=$($PYTHON "$ENGINE" "$QUERY" --quick 2>&1)

# Extract key warnings/issues
echo "⚠️  Community signals:"
echo "$OUTPUT" | grep -E "score:[0-9]+" | head -5
echo ""
echo "📋 Full research saved to ~/Documents/Last30Days/"
