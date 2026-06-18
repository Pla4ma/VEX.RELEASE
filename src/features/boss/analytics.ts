import * as Sentry from '@sentry/react-native';
import { hashUserId } from '../../utils/sentry-privacy';


export const BOSS_ANALYTICS_EVENTS = [
  'boss_route_opened',
  'boss_cta_clicked',
  'combat_ability_activated',
] as const;

export function trackBossEvent(): void {
  try {
    Sentry.addBreadcrumb({
      category: 'boss',
      message: 'boss_event',
      level: 'info',
    });
  } catch {
    // analytics failure must not break app flow
  }
}

export function trackBossRouteOpened(
  userId?: string | null,
  intensity?: string,
  canQuery?: boolean,
): void {
  try {
    Sentry.addBreadcrumb({
      category: 'boss',
      message: 'boss_route_opened',
      data: { userId: hashUserId(userId ?? ''), intensity, canQuery },
      level: 'info',
    });
  } catch {
    // analytics failure must not break app flow
  }
}

export function trackBossCTAClicked(
  userId?: string,
  minutes?: number,
  intensity?: string,
): void {
  try {
    Sentry.addBreadcrumb({
      category: 'boss',
      message: 'boss_cta_clicked',
      data: { userId: hashUserId(userId ?? ''), minutes, intensity },
      level: 'info',
    });
  } catch {
    // analytics failure must not break app flow
  }
}

export function trackCombatAbilityActivated(
  userId?: string,
  encounterId?: string,
  abilityId?: string,
  damage?: number,
  hadCombo?: boolean,
): void {
  try {
    Sentry.addBreadcrumb({
      category: 'boss',
      message: 'combat_ability_activated',
      data: { userId: hashUserId(userId ?? ''), encounterId, abilityId, damage, hadCombo },
      level: 'info',
    });
  } catch {
    // analytics failure must not break app flow
  }
}
