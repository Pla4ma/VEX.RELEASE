#!/bin/bash
# last30days-research.sh — Quick wrapper for Hermes workflows
# Usage: bash scripts/last30days-research.sh "topic" [--quick|--deep-research]

set -euo pipefail

TOPIC="${1:?Usage: $0 <topic> [--quick|--deep-research]}"
MODE="${2:---quick}"
PYTHON="python3.12"
ENGINE="$HOME/.agents/skills/last30days/scripts/last30days.py"
SAVE_DIR="$HOME/Documents/Last30Days"
OBSIDIAN_VAULT="/root/obsidian-vault/Obsidian Vault/02-Projects/VEX Status"

mkdir -p "$SAVE_DIR" "$OBSIDIAN_VAULT"

# Run research
OUTPUT=$($PYTHON "$ENGINE" "$TOPIC" $MODE --store 2>&1)

# Save to research vault
SLUG=$(echo "$TOPIC" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//' | sed 's/-$//')
DATE=$(date +%Y-%m-%d)
SAVE_PATH="$SAVE_DIR/$SLUG-$DATE.md"
echo "$OUTPUT" > "$SAVE_PATH"

# Append summary to Obsidian vault
cat >> "$OBSIDIAN_VAULT/daily-research-$DATE.md" << EOF

## $(date +%H:%M) — $TOPIC

$OUTPUT

---

EOF

echo "Research saved to: $SAVE_PATH"
echo "Obsidian updated: $OBSIDIAN_VAULT/daily-research-$DATE.md"
