export const BOSS_ANALYTICS_EVENTS = [] as const;
export function trackBossEvent(): void {}
export function trackBossRouteOpened(
  _userId?: string | null,
  _intensity?: string,
  _canQuery?: boolean,
): void {}
export function trackBossCTAClicked(
  _userId?: string,
  _minutes?: number,
  _intensity?: string,
): void {}
export function trackCombatAbilityActivated(
  _userId?: string,
  _encounterId?: string,
  _abilityId?: string,
  _damage?: number,
  _hadCombo?: boolean,
): void {}
