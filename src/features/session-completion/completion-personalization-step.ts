import * as Sentry from '@sentry/react-native';
import { getFocusProfile } from '../focus-profile/service';
import { resolveInitialLane } from '../lane-engine/service';
import { buildCompletionPersonalizationResult } from './completion-personalization';
import type { CompletionLedger } from './schemas';
import type { PostSessionStoryViewModel } from './service';
import type { SessionSummary } from '../../session/types';
import { buildPostSessionStoryViewModel } from './service';
import { buildFeatureAccess } from '../liveops-config/feature-access';
import { useOnboardingStore } from '../onboarding/store';
import {
  initializeOnboarding,
  getOnboardingState,
  recordSession,
} from '../onboarding/onboarding-state';

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

export function detectNewlyUnlockedFeatures(
  userId: string,
  summary: SessionSummary,
): string[] {
  const features: string[] = [];
  try {
    const state =
      getOnboardingState(userId) ?? initializeOnboarding(userId);
    const sessionsBefore = state.sessionsCompleted;
    recordSession(
      userId,
      Math.max(1, Math.round(summary.effectiveDuration / 60)),
      `session:${summary.sessionId ?? Date.now()}`,
    );
    const sessionsAfter = sessionsBefore + 1;
    const stateAfter = getOnboardingState(userId);
    if (stateAfter) {
      const boardFeatures = stateAfter.unlockedFeatures
        .filter((f) => !f.introduced)
        .map((f) => f.featureId);
      features.push(...boardFeatures);
    }
    const profile = useOnboardingStore.getState().motivationProfile;
    const before = buildFeatureAccess({
      totalCompletedSessions: sessionsBefore,
      motivationProfile: profile ?? undefined,
    });
    const after = buildFeatureAccess({
      totalCompletedSessions: sessionsAfter,
      motivationProfile: profile ?? undefined,
    });
    const featureSet = new Set(features);
    for (const [key, feat] of Object.entries(after.features)) {
      if (
        feat.isUnlocked &&
        !(before.features[key as keyof typeof before.features]?.isUnlocked)
      ) {
        if (!featureSet.has(key)) {
          features.push(key);
        }
      }
    }
  } catch (error) {
    Sentry.captureException(error, {
      tags: { feature: 'completion-unlock-detection' },
    });
  }
  return features;
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

  const newlyUnlockedFeatures = detectNewlyUnlockedFeatures(userId, summary);

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
