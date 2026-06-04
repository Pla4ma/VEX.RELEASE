import * as Sentry from '@sentry/react-native';
import { countCompletedSessions } from '../session-history/repository';
import { getFocusProfile } from '../focus-profile/service';
import { resolveInitialLane } from '../lane-engine/service';
import { resolveCompletionPersonalBest } from './personal-best-integration';
import { integrateCompletionPersonalization } from './completion-personalization-integration';
import { applyCompletionSideEffects } from './completion-side-effects';
import type { CompletionPersonalizationResult } from './schemas';
import type { PostSessionStoryViewModel } from './story-view-model-service';
import type { SessionSummary } from '../../session/types';

interface PersonalizationInput {
  userId: string;
  finalLedger: Parameters<typeof applyCompletionSideEffects>[0]['finalLedger'];
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

  let personalizationResult: CompletionPersonalizationResult | null = null;
  try {
    const sessionCount = await countCompletedSessions(userId).catch(() => 0);
    const focusProfile = await getFocusProfile(userId).catch(() => null);
    const laneProfile =
      focusProfile?.laneProfile ||
      resolveInitialLane({ observedAt: Date.now() });
    personalizationResult = await integrateCompletionPersonalization({
      deletedMemoryIds: [],
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
      ledger: finalLedger,
      sessionCount,
      summary,
    });
  } catch (error) {
    Sentry.captureException(error, {
      tags: { feature: 'completion-personalization' },
    });
  }

  return applyCompletionSideEffects({
    degradedSystems,
    finalLedger,
    isPersonalBest: personalBest.isPersonalBest,
    personalizationResult,
    sessionId: finalLedger.sessionId,
    summary,
    userId,
  });
}
