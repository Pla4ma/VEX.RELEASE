export const BOSS_ANALYTICS_EVENTS = [] as const;
export function trackBossEvent(): void {}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function trackBossRouteOpened(_userId?: string | null, _intensity?: string, _canQuery?: boolean): void {}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function trackBossCTAClicked(_userId?: string, _minutes?: number, _intensity?: string): void {}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function trackCombatAbilityActivated(_userId?: string, _encounterId?: string, _abilityId?: string, _damage?: number, _hadCombo?: boolean): void {}
