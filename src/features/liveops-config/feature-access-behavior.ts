import type {
  UnlockBehaviorEvidence,
} from './feature-access-types';
import type { BehaviorSignal } from '../personalization/behavior-signal-schemas';

const STUDY_SIGNALS: Record<string, true> = { study_surface_clicked: true };
const COACH_SIGNALS: Record<string, true> = { coach_surface_clicked: true };
const BOSS_SIGNALS: Record<string, true> = {
  boss_cta_clicked: true,
  boss_route_opened: true,
};

export function deriveUnlockBehaviorEvidence(
  signals: BehaviorSignal[],
  completedSessions: number,
): UnlockBehaviorEvidence {
  const studySurfaceClicks = signals.filter((signal) =>
    STUDY_SIGNALS[signal.signalType] === true,
  ).length;
  const coachInteractions = signals.filter((signal) =>
    COACH_SIGNALS[signal.signalType] === true,
  ).length;
  const bossEngagementCount = signals.filter((signal) =>
    BOSS_SIGNALS[signal.signalType] === true,
  ).length;
  const bossEngagement =
    bossEngagementCount >= 3
      ? 'high'
      : bossEngagementCount === 2
        ? 'medium'
        : bossEngagementCount === 1
          ? 'low'
          : 'none';
  const ignoredFeatures = signals
    .filter((signal) => signal.signalType.endsWith('_dismissed'))
    .map((signal) => signal.surfaceKey);
  const premiumFeatureAttempts = signals
    .filter((signal) => signal.signalType.startsWith('premium_gate_'))
    .map((signal) => signal.surfaceKey);

  return {
    bossEngagement,
    coachInteractions,
    ignoredFeatures: [...new Set(ignoredFeatures)],
    premiumFeatureAttempts: [...new Set(premiumFeatureAttempts)],
    studySurfaceClicks: Math.min(studySurfaceClicks, completedSessions * 3),
  };
}
