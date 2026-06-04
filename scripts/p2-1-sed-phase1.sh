#!/bin/bash
# P2-1: Replace hardcoded hex colors with theme tokens
# This script does safe, pattern-specific replacements.

set -e
cd /root/projects/VEX.RELEASE

# Files to process (excluding theme/tokens, __tests__, archive, node_modules)
TARGET_FILES=$(grep -rln '#[0-9A-Fa-f]\{6\}\|#[0-9A-Fa-f]\{3\}' src/ --include='*.ts' --include='*.tsx' | grep -v 'theme/tokens\|__tests__\|node_modules\|archive')

echo "=== Phase 1: High-frequency colors with clear semantic mappings ==="

# #fff → lightColors.text.inverse (most common: 108 occurrences)
for f in $TARGET_FILES; do
  sed -i "s/'#fff'/lightColors.text.inverse/g" "$f"
  sed -i "s/=\"#fff\"/={lightColors.text.inverse}/g" "$f"
done

# #ffffff → lightColors.text.inverse (101 occurrences)
for f in $TARGET_FILES; do
  sed -i "s/'#ffffff'/lightColors.text.inverse/g" "$f"
  sed -i "s/=\"#ffffff\"/={lightColors.text.inverse}/g" "$f"
done

# #9e9e9e → lightColors.text.muted (43)
for f in $TARGET_FILES; do
  sed -i "s/'#9e9e9e'/lightColors.text.muted/g" "$f"
done

# #9ca3af → lightColors.text.muted (41)
for f in $TARGET_FILES; do
  sed -i "s/'#9ca3af'/lightColors.text.muted/g" "$f"
done

# #6b7280 → lightColors.text.muted (33)
for f in $TARGET_FILES; do
  sed -i "s/'#6b7280'/lightColors.text.muted/g" "$f"
done

# #666 → lightColors.text.muted (31)
for f in $TARGET_FILES; do
  sed -i "s/'#666'/lightColors.text.muted/g" "$f"
  sed -i "s/=\"#666\"/={lightColors.text.muted}/g" "$f"
done

# #1a1a2e → lightColors.semantic.background (30)
for f in $TARGET_FILES; do
  sed -i "s/'#1a1a2e'/lightColors.semantic.background/g" "$f"
done

# #2a2a3e → lightColors.semantic.backgroundElevated (38)
for f in $TARGET_FILES; do
  sed -i "s/'#2a2a3e'/lightColors.semantic.backgroundElevated/g" "$f"
done

# #3a3a4e → lightColors.semantic.border
for f in $TARGET_FILES; do
  sed -i "s/'#3a3a4e'/lightColors.semantic.border/g" "$f"
done

echo "=== Phase 2: Semantic/danger/success/warning colors ==="

# #e94560 → lightColors.semantic.danger (29)
for f in $TARGET_FILES; do
  sed -i "s/'#e94560'/lightColors.semantic.danger/g" "$f"
done

# #4caf50 → lightColors.semantic.success (29)
for f in $TARGET_FILES; do
  sed -i "s/'#4caf50'/lightColors.semantic.success/g" "$f"
done

# #ef4444 → lightColors.semantic.danger (37)
for f in $TARGET_FILES; do
  sed -i "s/'#ef4444'/lightColors.semantic.danger/g" "$f"
done

# #f59e0b → lightColors.semantic.warning (29)
for f in $TARGET_FILES; do
  sed -i "s/'#f59e0b'/lightColors.semantic.warning/g" "$f"
done

# #6366f1 → lightColors.semantic.primary (42)
for f in $TARGET_FILES; do
  sed -i "s/'#6366f1'/lightColors.semantic.primary/g" "$f"
done

# #3b82f6 → lightColors.accent.blue (43)
for f in $TARGET_FILES; do
  sed -i "s/'#3b82f6'/lightColors.accent.blue/g" "$f"
done

# #4ecdc4 → lightColors.accent.teal (24)
for f in $TARGET_FILES; do
  sed -i "s/'#4ecdc4'/lightColors.accent.teal/g" "$f"
done

# #000 → lightColors.text.primary (24)
for f in $TARGET_FILES; do
  sed -i "s/'#000'/lightColors.text.primary/g" "$f"
done

echo "=== Phase 3: More semantic colors ==="

# #111827 → lightColors.semantic.backgroundMuted (22)
for f in $TARGET_FILES; do
  sed -i "s/'#111827'/lightColors.semantic.backgroundMuted/g" "$f"
done

# #10b981 → lightColors.accent.green (21)
for f in $TARGET_FILES; do
  sed -i "s/'#10b981'/lightColors.accent.green/g" "$f"
done

# #ffd700 → lightColors.semantic.vexGold (18)
for f in $TARGET_FILES; do
  sed -i "s/'#ffd700'/lightColors.semantic.vexGold/g" "$f"
done

# #22c55e → lightColors.semantic.success (18)
for f in $TARGET_FILES; do
  sed -i "s/'#22c55e'/lightColors.semantic.success/g" "$f"
done

# #f44336 → lightColors.semantic.danger (10)
for f in $TARGET_FILES; do
  sed -i "s/'#f44336'/lightColors.semantic.danger/g" "$f"
done

# #ffc107 → lightColors.semantic.warning
for f in $TARGET_FILES; do
  sed -i "s/'#ffc107'/lightColors.semantic.warning/g" "$f"
done

# #ffa500 → lightColors.semantic.warning
for f in $TARGET_FILES; do
  sed -i "s/'#ffa500'/lightColors.semantic.warning/g" "$f"
done

# #ff9800 → lightColors.semantic.warning
for f in $TARGET_FILES; do
  sed -i "s/'#ff9800'/lightColors.semantic.warning/g" "$f"
done

# #ff6b35 → lightColors.semantic.warning
for f in $TARGET_FILES; do
  sed -i "s/'#ff6b35'/lightColors.semantic.warning/g" "$f"
done

# #a855f7 → lightColors.accent.purple
for f in $TARGET_FILES; do
  sed -i "s/'#a855f7'/lightColors.accent.purple/g" "$f"
done

# #8b5cf6 → lightColors.accent.purple
for f in $TARGET_FILES; do
  sed -i "s/'#8b5cf6'/lightColors.accent.purple/g" "$f"
done

# #ec4899 → lightColors.accent.pink
for f in $TARGET_FILES; do
  sed -i "s/'#ec4899'/lightColors.accent.pink/g" "$f"
done

# #1a1a1a → lightColors.semantic.obsidian
for f in $TARGET_FILES; do
  sed -i "s/'#1a1a1a'/lightColors.semantic.obsidian/g" "$f"
done

# #2a2a2a → lightColors.semantic.obsidian
for f in $TARGET_FILES; do
  sed -i "s/'#2a2a2a'/lightColors.semantic.obsidian/g" "$f"
done

# #4f46e5 → lightColors.semantic.primary
for f in $TARGET_FILES; do
  sed -i "s/'#4f46e5'/lightColors.semantic.primary/g" "$f"
done

echo "=== Phase 4: Text/border muted colors ==="

# #374151 → lightColors.text.muted
for f in $TARGET_FILES; do
  sed -i "s/'#374151'/lightColors.text.muted/g" "$f"
done

# #e5e7eb → lightColors.border.light
for f in $TARGET_FILES; do
  sed -i "s/'#e5e7eb'/lightColors.border.light/g" "$f"
done

# #f3f4f6 → lightColors.surface.button
for f in $TARGET_FILES; do
  sed -i "s/'#f3f4f6'/lightColors.surface.button/g" "$f"
done

# #4a5568 → lightColors.text.tertiary
for f in $TARGET_FILES; do
  sed -i "s/'#4a5568'/lightColors.text.tertiary/g" "$f"
done

# #64748b → lightColors.text.tertiary
for f in $TARGET_FILES; do
  sed -i "s/'#64748b'/lightColors.text.tertiary/g" "$f"
done

# #94a3b8 → lightColors.text.disabled
for f in $TARGET_FILES; do
  sed -i "s/'#94a3b8'/lightColors.text.disabled/g" "$f"
done

# #334155 → lightColors.text.secondary
for f in $TARGET_FILES; do
  sed -i "s/'#334155'/lightColors.text.secondary/g" "$f"
done

# #e1e4e8 → lightColors.border.light
for f in $TARGET_FILES; do
  sed -i "s/'#e1e4e8'/lightColors.border.light/g" "$f"
done

# #bdbdbd → lightColors.text.disabled
for f in $TARGET_FILES; do
  sed -i "s/'#bdbdbd'/lightColors.text.disabled/g" "$f"
done

echo "=== Phase 5: Additional common colors ==="

# #ff6b6b → lightColors.semantic.danger
for f in $TARGET_FILES; do
  sed -i "s/'#ff6b6b'/lightColors.semantic.danger/g" "$f"
done

# #fee2e2 → lightColors.error[50]
for f in $TARGET_FILES; do
  sed -i "s/'#fee2e2'/lightColors.error[50]/g" "$f"
done

# #fef3c7 → lightColors.warning[50]
for f in $TARGET_FILES; do
  sed -i "s/'#fef3c7'/lightColors.warning[50]/g" "$f"
done

# #9333ea → lightColors.accent.purple
for f in $TARGET_FILES; do
  sed -i "s/'#9333ea'/lightColors.accent.purple/g" "$f"
done

# #6d28d9 → lightColors.accent.purple
for f in $TARGET_FILES; do
  sed -i "s/'#6d28d9'/lightColors.accent.purple/g" "$f"
done

# #7c3aed → lightColors.accent.purple
for f in $TARGET_FILES; do
  sed -i "s/'#7c3aed'/lightColors.accent.purple/g" "$f"
done

# #b45309 → lightColors.semantic.warning
for f in $TARGET_FILES; do
  sed -i "s/'#b45309'/lightColors.semantic.warning/g" "$f"
done

# #92400e → lightColors.semantic.warning
for f in $TARGET_FILES; do
  sed -i "s/'#92400e'/lightColors.semantic.warning/g" "$f"
done

# #dc2626 → lightColors.semantic.danger
for f in $TARGET_FILES; do
  sed -i "s/'#dc2626'/lightColors.semantic.danger/g" "$f"
done

# #b91c1c → lightColors.semantic.danger
for f in $TARGET_FILES; do
  sed -i "s/'#b91c1c'/lightColors.semantic.danger/g" "$f"
done

# #f97316 → lightColors.accent.orange
for f in $TARGET_FILES; do
  sed -i "s/'#f97316'/lightColors.accent.orange/g" "$f"
done

# #ea580c → lightColors.accent.orange
for f in $TARGET_FILES; do
  sed -i "s/'#ea580c'/lightColors.accent.orange/g" "$f"
done

# #fbbf24 → lightColors.semantic.warning
for f in $TARGET_FILES; do
  sed -i "s/'#fbbf24'/lightColors.semantic.warning/g" "$f"
done

# #8bc34a → lightColors.semantic.success
for f in $TARGET_FILES; do
  sed -i "s/'#8bc34a'/lightColors.semantic.success/g" "$f"
done

# #f1f5f9 → lightColors.surface.button
for f in $TARGET_FILES; do
  sed -i "s/'#f1f5f9'/lightColors.surface.button/g" "$f"
done

# #e2e8f0 → lightColors.surface.pressed
for f in $TARGET_FILES; do
  sed -i "s/'#e2e8f0'/lightColors.surface.pressed/g" "$f"
done

# #14b8a6 → lightColors.accent.teal
for f in $TARGET_FILES; do
  sed -i "s/'#14b8a6'/lightColors.accent.teal/g" "$f"
done

# #06b6d4 → lightColors.accent.teal
for f in $TARGET_FILES; do
  sed -i "s/'#06b6d4'/lightColors.accent.teal/g" "$f"
done

# #2563eb → lightColors.accent.blue
for f in $TARGET_FILES; do
  sed -i "s/'#2563eb'/lightColors.accent.blue/g" "$f"
done

# #1d4ed8 → lightColors.info.DEFAULT
for f in $TARGET_FILES; do
  sed -i "s/'#1d4ed8'/lightColors.info.DEFAULT/g" "$f"
done

# #60a5fa → lightColors.accent.blue
for f in $TARGET_FILES; do
  sed -i "s/'#60a5fa'/lightColors.accent.blue/g" "$f"
done

# #16a34a → lightColors.semantic.success
for f in $TARGET_FILES; do
  sed -i "s/'#16a34a'/lightColors.semantic.success/g" "$f"
done

# #059669 → lightColors.semantic.success
for f in $TARGET_FILES; do
  sed -i "s/'#059669'/lightColors.semantic.success/g" "$f"
done

# #0d1117 → lightColors.semantic.backgroundMuted
for f in $TARGET_FILES; do
  sed -i "s/'#0d1117'/lightColors.semantic.backgroundMuted/g" "$f"
done

# #1e293b → lightColors.semantic.backgroundMuted
for f in $TARGET_FILES; do
  sed -i "s/'#1e293b'/lightColors.semantic.backgroundMuted/g" "$f"
done

# #0f172a → lightColors.semantic.backgroundMuted
for f in $TARGET_FILES; do
  sed -i "s/'#0f172a'/lightColors.semantic.backgroundMuted/g" "$f"
done

echo "=== Done with sed replacements ==="
echo "Now run the import-fixing pass..."
