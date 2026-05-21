import type { HomeContextSnapshot, HomePrimaryPriority } from './priority-schemas';
import { getFeatureAvailability, isFeatureAvailableForNavigation } from '../liveops-config';
import type { FeatureAccessMap } from '../liveops-config';

function mapPromiseModeToPresetMode(
  mode: HomeContextSnapshot['companionPromise']['targetMode'],
): 'DEEP_WORK' | 'LIGHT_FOCUS' | 'SPRINT' | 'STUDY' {
  if (mode === 'RECOVERY') { return 'LIGHT_FOCUS'; }
  if (mode === 'STUDY') { return 'STUDY'; }
  if (mode === 'HABIT_BUILD') { return 'SPRINT'; }
  return 'DEEP_WORK';
}

function buildSessionPriority(
  type: HomePrimaryPriority['type'],
  urgency: number,
  reason: string,
  text: string,
  params?: Record<string, unknown>,
): HomePrimaryPriority {
  return {
    cta: { action: 'OPEN_SESSION_SETUP', params, text },
    reason,
    type,
    urgency,
  };
}

export function checkStreakCritical(
  snapshot: HomeContextSnapshot,
): HomePrimaryPriority | null {
  const hoursRemaining = snapshot.streak.hoursRemaining;
  if (!snapshot.streak.isAtRisk || typeof hoursRemaining !== 'number' || hoursRemaining > 2) {
    return null;
  }
  return buildSessionPriority(
    'STREAK_CRITICAL',
    100,
    `Your ${snapshot.streak.currentDays}-day streak is close to breaking.`,
    'Save Your Streak',
    { presetMode: 'LIGHT_FOCUS', suggestedDurationSeconds: 15 * 60 },
  );
}

export function checkCompanionPromise(
  snapshot: HomeContextSnapshot,
): HomePrimaryPriority | null {
  if (snapshot.companionPromise.kind !== 'pending') {
    return null;
  }
  const duration = snapshot.companionPromise.targetDurationMinutes ?? 15;
  return buildSessionPriority(
    'COMPANION_PROMISE',
    95,
    `Keep the thread alive with ${duration} focused minutes today.`,
    'Keep Your Promise',
    {
      presetMode: mapPromiseModeToPresetMode(snapshot.companionPromise.targetMode),
      suggestedDurationSeconds: duration * 60,
    },
  );
}

export function checkPromiseRecovery(
  snapshot: HomeContextSnapshot,
): HomePrimaryPriority | null {
  if (snapshot.companionPromise.kind !== 'missed') {
    return null;
  }
  return buildSessionPriority(
    'PROMISE_RECOVERY',
    90,
    'Yesterday slipped. A small clean session rebuilds the thread.',
    'Start Fresh Today',
    { presetMode: 'LIGHT_FOCUS', suggestedDurationSeconds: 10 * 60 },
  );
}

export function checkStreakAtRisk(
  snapshot: HomeContextSnapshot,
): HomePrimaryPriority | null {
  if (!snapshot.streak.isAtRisk) {
    return null;
  }
  return buildSessionPriority(
    'STREAK_AT_RISK',
    85,
    'A short focus block keeps today from turning into recovery tomorrow.',
    'Protect Today',
    { presetMode: 'LIGHT_FOCUS', suggestedDurationSeconds: 15 * 60 },
  );
}

export function checkRecommendedSession(
  snapshot: HomeContextSnapshot,
): HomePrimaryPriority | null {
  if (!snapshot.recommendation.hasActive) {
    return null;
  }
  return buildSessionPriority(
    'RECOMMENDED_SESSION',
    70,
    'VEX already has a strong next session ready for this moment.',
    'Start Recommended Session',
    {
      recommendationId: snapshot.recommendation.id,
      suggestedDurationSeconds: snapshot.recommendation.suggestedDurationSeconds,
    },
  );
}

export function checkChallengeNearDone(
  snapshot: HomeContextSnapshot,
  featureAccess?: FeatureAccessMap,
): HomePrimaryPriority | null {
  if (!snapshot.challenge.isNearDone) {
    return null;
  }
  if (featureAccess) {
    const availability = getFeatureAvailability(featureAccess.challenges);
    if (!isFeatureAvailableForNavigation(availability)) {
      return null;
    }
  }
  return {
    cta: { action: 'OPEN_CHALLENGES', text: 'Start Target Session' },
    reason: `${Math.round(snapshot.challenge.progressPercent)}% done. The challenge is just the wrapper; one focused block is the move.`,
    type: 'CHALLENGE_NEAR_DONE',
    urgency: 60,
  };
}

export function checkBossActive(
  snapshot: HomeContextSnapshot,
  featureAccess?: FeatureAccessMap,
): HomePrimaryPriority | null {
  if (!snapshot.boss.hasActiveEncounter) {
    return null;
  }
  if (featureAccess) {
    const availability = getFeatureAvailability(featureAccess.boss_tab);
    if (!isFeatureAvailableForNavigation(availability)) {
      return null;
    }
  }
  return {
    cta: { action: 'OPEN_BOSS', text: 'Start Focus Session' },
    reason: 'Boss damage only comes from focused minutes. One clean session moves the bar.',
    type: 'BOSS_ACTIVE',
    urgency: 50,
  };
}

export function checkDefaultSession(
  snapshot: HomeContextSnapshot,
): HomePrimaryPriority {
  const isNewUser = !snapshot.onboarding.firstSessionCompleted;
  return buildSessionPriority(
    'DEFAULT_SESSION',
    10,
    isNewUser
      ? 'Start one clean session. The rest of home will get smarter after that.'
      : 'Start the next focus block without overthinking the setup.',
    isNewUser ? 'Start First Session' : 'Start Focus',
    {
      presetMode: isNewUser ? 'SPRINT' : 'DEEP_WORK',
      suggestedDurationSeconds: isNewUser ? 10 * 60 : 25 * 60,
    },
  );
}

export function getPriorityCandidates(
  snapshot: HomeContextSnapshot,
  featureAccess?: FeatureAccessMap,
): HomePrimaryPriority[] {
  return [
    checkStreakCritical(snapshot),
    checkCompanionPromise(snapshot),
    checkPromiseRecovery(snapshot),
    checkStreakAtRisk(snapshot),
    checkRecommendedSession(snapshot),
    checkChallengeNearDone(snapshot, featureAccess),
    checkBossActive(snapshot, featureAccess),
    checkDefaultSession(snapshot),
  ].filter((priority): priority is HomePrimaryPriority => priority !== null);
}
