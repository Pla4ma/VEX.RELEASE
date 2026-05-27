export function shouldShowBossPreview(): boolean {
  return false;
}
export function isCombatAllowed(_policy?: unknown): boolean {
  return false;
}
export function isBossVisibleAtSurface(_policy?: unknown): boolean {
  return false;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useBossDisplayPolicy(_context?: string): {
  isVisible: boolean;
  combatAllowed: boolean;
} {
  return { isVisible: false, combatAllowed: false };
}
export function getBossDisplayCopy(): { title: string; subtitle: string } {
  return { title: "", subtitle: "" };
}
export const isBossVisibleAtHome = false;
