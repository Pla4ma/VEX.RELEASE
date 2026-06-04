/**
 * P2-1: Hardcoded hex color → theme token mapping
 *
 * This maps common hardcoded hex colors to their semantic token paths.
 * For colors that don't have a semantic mapping, they use launchColors (hex color registry).
 */
export const SEMANTIC_MAP: Record<string, string> = {
  // Dark backgrounds (very common in this codebase)
  '#1a1a2e': 'lightColors.semantic.background',        // main dark bg
  '#2a2a3e': 'lightColors.semantic.backgroundElevated', // elevated dark bg
  '#3a3a4e': 'lightColors.semantic.border',            // subtle dark border
  '#111827': 'lightColors.semantic.backgroundMuted',   // muted dark bg

  // Light backgrounds
  '#f7f9fc': 'lightColors.semantic.background',
  '#ffffff20': 'lightColors.semantic.surfaceGlass',
  '#f3f4f6': 'lightColors.semantic.surfaceMuted',

  // Primary / accent colors
  '#e94560': 'lightColors.semantic.danger',            // VEX danger/accent red
  '#4caf50': 'lightColors.semantic.success',           // green (success)
  '#6366f1': 'lightColors.semantic.primary',           // indigo primary
  '#8b5cf6': 'lightColors.accent.purple',              // purple accent
  '#3b82f6': 'lightColors.accent.blue',                // blue accent
  '#10b981': 'lightColors.accent.green',               // green accent
  '#f59e0b': 'lightColors.semantic.warning',           // amber warning
  '#ec4899': 'lightColors.accent.pink',                // pink accent
  '#a855f7': 'lightColors.accent.purple',              // another purple

  // Text colors
  '#fff': 'lightColors.text.inverse',
  '#ffffff': 'lightColors.text.inverse',
  '#000': 'lightColors.text.primary',
  '#000000': 'lightColors.text.primary',
  '#9e9e9e': 'lightColors.text.muted',
  '#9ca3af': 'lightColors.text.muted',
  '#6b7280': 'lightColors.text.muted',
  '#666': 'lightColors.text.muted',
  '#333': 'lightColors.text.secondary',
  '#555': 'lightColors.text.tertiary',
  '#888': 'lightColors.text.disabled',
  '#999': 'lightColors.text.disabled',

  // Border colors
  '#e5e7eb': 'lightColors.border.light',
  '#e1e4e8': 'lightColors.border.light',

  // Status / semantic colors
  '#ef4444': 'lightColors.semantic.danger',
  '#f44336': 'lightColors.semantic.danger',
  '#22c55e': 'lightColors.semantic.success',
  '#ffc107': 'lightColors.semantic.warning',
  '#ffa500': 'lightColors.semantic.warning',
  '#ff9800': 'lightColors.semantic.warning',
  '#ff6b35': 'lightColors.semantic.warning',
  '#ffd700': 'lightColors.semantic.vexGold',

  // VEX brand colors
  '#00e5ff': 'lightColors.semantic.vexCyan',
  '#1a1a1a': 'lightColors.semantic.obsidian',
  '#2a2a2a': 'lightColors.semantic.obsidian',
};

/**
 * For colors that don't have a semantic mapping, look them up in launchColors.
 * This generates the launchColors reference like: launchColors.hex_4ecdc4
 */
export function hexToLaunchColorRef(hex: string): string | null {
  const normalized = hex.replace('#', '').toLowerCase();
  const key = `hex_${normalized}`;
  return `launchColors.${key}`;
}
