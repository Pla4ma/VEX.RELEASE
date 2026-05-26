export function trackCombatAbilityActivated(): void {}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyBossDamageRules(damage: number, _input?: any): number { return damage; }

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _safeParse = (_data?: unknown) => ({ success: false, data: null } as const);
export const BossAttackPatternSchema = { parse: () => ({}), safeParse: _safeParse };
export const COMBAT_ABILITIES: Array<{
  id: string;
  name: string;
  icon: string;
  requiresStreak: number;
  focusEnergyCost: number;
  cooldownSeconds: number;
}> = [
  { id: 'focus_strike', name: 'Focus Strike', icon: 'zap', requiresStreak: 0, focusEnergyCost: 20, cooldownSeconds: 10 },
];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function executeCombatAbility(_encounterState: any, _abilityId: string, _streakDays: number, _now: number): {
  success: boolean;
  damageDealt: number;
  comboBonus: number;
} {
  return { success: false, damageDealt: 0, comboBonus: 0 };
}
export type CombatActionResult = {
  success: boolean;
  damageDealt: number;
  comboBonus: number;
};
