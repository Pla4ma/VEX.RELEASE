import * as Sentry from '@sentry/react-native';
import { getFocusProfile } from '../focus-profile/service';
import { resolveInitialLane } from '../lane-engine/service';
import { buildCompletionPersonalizationResult } from './completion-personalization';
import type { CompletionLedger } from './schemas';
import type { PostSessionStoryViewModel } from './service';
import type { SessionSummary } from '../../session/types';
import { buildPostSessionStoryViewModel } from './service';

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

export async function applyPersonalizationAndSideEffects(
  input: PersonalizationInput,
): Promise<PostSessionStoryViewModel> {
  const { userId, finalLedger, summary, degradedSystems } = input;

  const personalBest = await resolveCompletionPersonalBest(
    userId,
    finalLedger,
    summary,
  );

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
    summary,
  });
}
