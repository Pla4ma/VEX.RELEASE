import * as Sentry from '@sentry/react-native';
import { getFocusProfile } from '../focus-profile/service';
import { resolveInitialLane } from '../lane-engine/service';
import { buildCompletionPersonalizationResult } from './completion-personalization';
import type { CompletionLedger } from './schemas';
import type { PostSessionStoryViewModel } from './post-session-story-view-model';
import type { SessionSummary } from '../../session/types';
import { buildPostSessionStoryViewModel } from './post-session-story-view-model';
import { buildFeatureAccess } from '../liveops-config/feature-access';
import { useOnboardingStore } from '../onboarding/store';
import { FEATURE_UNLOCK_GATES } from '../onboarding/onboarding-gates';
import { getSessionOrchestrator } from '../../session/SessionOrchestrator';

async function resolveCompletionPersonalBest(
  _userId: string,
  _ledger: CompletionLedger,
  _summary: SessionSummary,
): Promise<{ isPersonalBest: boolean }> {
  return { isPersonalBest: false };
}

interface PersonalizationInput {
  userId: string;
  finalLedger: CompletionLedger;
  summary: SessionSummary;
  degradedSystems: string[];
}

export async function detectNewlyUnlockedFeatures(
  userId: string,
  summary: SessionSummary,
): Promise<string[]> {
  try {
    const orchestrator = getSessionOrchestrator();
    orchestrator.setUserId(userId);
    const sessionStats = await orchestrator.getSessionStats();
    const sessionsAfter = sessionStats.completedSessions;
    const sessionsBefore = Math.max(0, sessionsAfter - 1);
    const features = FEATURE_UNLOCK_GATES
      .filter(
        (gate) =>
          sessionsBefore < gate.requiresSessions &&
          sessionsAfter >= gate.requiresSessions,
      )
      .map((gate) => gate.featureId);
    const profile = useOnboardingStore.getState().motivationProfile;
    const before = buildFeatureAccess({
      totalCompletedSessions: sessionsBefore,
      motivationProfile: profile ?? undefined,
    });
    const after = buildFeatureAccess({
      totalCompletedSessions: sessionsAfter,
      motivationProfile: profile ?? undefined,
    });
    for (const key of Object.keys(after.features)) {
      if (!hasFeatureKey(after.features, key) || !hasFeatureKey(before.features, key)) {
        continue;
      }
      if (
        after.features[key].isUnlocked &&
        !before.features[key].isUnlocked &&
        !features.includes(key)
      ) {
        features.push(key);
      }
    }
    return features;
  } catch (error: unknown) {
    Sentry.captureException(error, {
      tags: { feature: 'completion-unlock-detection' },
      extra: { userId, sessionId: summary.sessionId },
    });
    return [];
  }
}

function hasFeatureKey<T extends object>(
  features: T,
  key: string,
): key is Extract<keyof T, string> {
  return Object.prototype.hasOwnProperty.call(features, key);
}

export async function applyPersonalizationAndSideEffects(
  input: PersonalizationInput,
): Promise<PostSessionStoryViewModel> {
  const { userId, finalLedger, summary, degradedSystems } = input;

  const personalBest = await resolveCompletionPersonalBest(
    userId,
    finalLedger,
    summary,
  );

  const newlyUnlockedFeatures = await detectNewlyUnlockedFeatures(userId, summary);

  try {
    const focusProfile = await getFocusProfile(userId).catch(() => null);
    const laneProfile =
      focusProfile?.laneProfile ||
      resolveInitialLane({ observedAt: Date.now() });
    buildCompletionPersonalizationResult({
      deletedMemoryIds: [],
      focusScoreDelta: finalLedger.focusScoreDelta,
      grade: finalLedger.grade,
      hiddenFeatureKeys: [
        'shop',
        'inventory',
        'battle_pass',
        'premium_currency',
        'wagers',
      ],
      isComeback: summary.sessionMode === 'RECOVERY',
      isPersonalBest: personalBest.isPersonalBest,
      laneProfile,
      streakAction: finalLedger.streakResult.action,
      streakDays: finalLedger.streakResult.newDays,
      summary,
      xpDelta: finalLedger.xpDelta,
    });
  } catch (error) {
    Sentry.captureException(error, {
      tags: { feature: 'completion-personalization' },
    });
  }

  return buildPostSessionStoryViewModel({
    degradedSystems,
    ledger: finalLedger,
    newlyUnlockedFeatures,
    summary,
  });
}
