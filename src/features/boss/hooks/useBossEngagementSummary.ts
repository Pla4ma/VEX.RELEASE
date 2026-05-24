import { useMemo } from 'react';
import { getBehaviorSignals } from '../../personalization/behavior-signal-store';

export interface BossEngagementSummary {
  bossRouteOpenedCount: number;
  bossCTAClickedCount: number;
  bossDamageEventsCount: number;
  recentSessionsWithBossProgress: number;
  bossIgnored: boolean;
}

function countSignalType(
  userId: string,
  signalType: string,
): number {
  const signals = getBehaviorSignals(userId, { maxAgeMs: 14 * 24 * 60 * 60 * 1000, maxSignals: 50 });
  return signals.filter((s) => s.signalType === signalType).length;
}

function countDismissedBossSignals(userId: string): number {
  const signals = getBehaviorSignals(userId, { maxAgeMs: 14 * 24 * 60 * 60 * 1000, maxSignals: 50 });
  return signals.filter(
    (s) => s.signalType === 'surface_dismissed' && s.surfaceKey === 'boss_tab',
  ).length;
}

function countBossSessionsFromSignals(userId: string): number {
  const signals = getBehaviorSignals(userId, { maxAgeMs: 7 * 24 * 60 * 60 * 1000, maxSignals: 50 });
  const damageSignals = signals.filter(
    (s) => s.signalType === 'boss_cta_clicked' && s.source === 'boss_tab',
  ).length;
  const routeOpens = signals.filter(
    (s) => s.signalType === 'boss_route_opened',
  ).length;
  return Math.max(0, Math.floor((damageSignals + routeOpens) / 2));
}

export function useBossEngagementSummary(
  userId: string | null,
): BossEngagementSummary {
  return useMemo(() => {
    if (!userId) {
      return {
        bossRouteOpenedCount: 0,
        bossCTAClickedCount: 0,
        bossDamageEventsCount: 0,
        recentSessionsWithBossProgress: 0,
        bossIgnored: false,
      };
    }

    const bossRouteOpenedCount = countSignalType(userId, 'boss_route_opened');
    const bossCTAClickedCount = countSignalType(userId, 'boss_cta_clicked');
    const dismissedCount = countDismissedBossSignals(userId);
    const bossDamageEventsCount = countBossSessionsFromSignals(userId);
    const bossIgnored = dismissedCount >= 3;

    return {
      bossRouteOpenedCount,
      bossCTAClickedCount,
      bossDamageEventsCount,
      recentSessionsWithBossProgress: bossDamageEventsCount,
      bossIgnored,
    };
  }, [userId]);
}
