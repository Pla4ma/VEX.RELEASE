/**
 * Boss Analytics
 * Sentry breadcrumbs and custom event tracking
 */

import * as Sentry from '@sentry/react-native';
import { eventBus } from '../../events';

// ============================================================================
// Event Tracking Functions
// ============================================================================

export function trackBossEncounterStarted(
  encounterId: string,
  bossId: string,
  userId: string,
  maxHealth: number
): void {
  Sentry.addBreadcrumb({
    category: 'boss',
    message: 'Boss encounter started',
    data: {
      encounterId,
      bossId,
      userId,
      maxHealth,
    },
    level: 'info',
  });
}

export function trackBossDamageApplied(
  encounterId: string,
  damage: number,
  healthRemaining: number,
  isDefeated: boolean
): void {
  Sentry.addBreadcrumb({
    category: 'boss',
    message: isDefeated ? 'Boss defeated' : 'Damage applied to boss',
    data: {
      encounterId,
      damage,
      healthRemaining,
      isDefeated,
    },
    level: isDefeated ? 'info' : 'debug',
  });
}

export function trackBossTimeout(encounterId: string, bossId: string): void {
  Sentry.addBreadcrumb({
    category: 'boss',
    message: 'Boss encounter timed out',
    data: {
      encounterId,
      bossId,
    },
    level: 'warning',
  });
}

export function trackBossError(
  operation: string,
  error: unknown,
  userId?: string
): void {
  Sentry.addBreadcrumb({
    category: 'boss',
    message: `Boss error: ${operation}`,
    data: {
      userId,
      error: error instanceof Error ? error.message : 'Unknown error',
    },
    level: 'error',
  });
}

export function trackCombatAbilityActivated(
  userId: string,
  encounterId: string,
  abilityId: string,
  damageDealt: number,
  isCombo: boolean
): void {
  Sentry.addBreadcrumb({
    category: 'boss',
    message: 'Combat ability activated',
    data: {
      userId,
      encounterId,
      abilityId,
      damageDealt,
      isCombo,
    },
    level: 'info',
  });

  eventBus.publish('analytics:track', {
    event: 'combat_ability_activated',
    properties: {
      userId,
      encounterId,
      abilityId,
      damageDealt,
      isCombo,
    },
  });
}

export function trackBossRouteOpened(
  userId: string | null,
  bossIntensity: string,
  canQueryBoss: boolean,
): void {
  Sentry.addBreadcrumb({
    category: 'boss',
    message: 'Boss route opened',
    data: { userId, bossIntensity, canQueryBoss },
    level: 'info',
  });
  eventBus.publish('analytics:track', {
    event: 'boss_route_opened',
    properties: { userId, bossIntensity, canQueryBoss },
  });
}

export function trackBossCTAClicked(
  userId: string | null,
  minutes: number,
  bossIntensity: string,
): void {
  Sentry.addBreadcrumb({
    category: 'boss',
    message: 'Boss CTA clicked',
    data: { userId, minutes, bossIntensity },
    level: 'info',
  });
}

export function trackBossSurfaceDismissed(
  userId: string | null,
  reason: string,
): void {
  Sentry.addBreadcrumb({
    category: 'boss',
    message: 'Boss surface dismissed',
    data: { userId, reason },
    level: 'info',
  });
}
