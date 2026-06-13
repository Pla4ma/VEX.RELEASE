/**
 * Post-Session Story View Model Builder
 *
 * Builds the view model for the session completion story screen.
 */

import { CompletionLedgerSchema, type CompletionLedger, type SessionSummary } from './schemas';
import { SessionMode } from '../../session/modes';

export type PostSessionStoryViewModel = {
  degradedWarnings: string[];
  grade: CompletionLedger['grade'];
  headline: {
    type: string;
    value?: string;
    title?: string;
  };
  ledgerId: string;
  newlyUnlockedFeatures: string[];
  personalBestProof?: {
    achievedAt: string;
    durationBucket: string;
    mode: string;
    newValue: number;
    oldValue: number;
  };
  sessionId: string;
  summary: SessionSummary;
  xpDelta: number;
};

export function buildPostSessionStoryViewModel(input: {
  degradedWarnings?: string[];
  degradedSystems?: string[];
  ledger: CompletionLedger;
  newlyUnlockedFeatures?: string[];
  personalBest?: {
    achievedAt: string;
    durationBucket: string;
    isPersonalBest: boolean;
    previousBest: number;
    purityScore: number;
    sessionMode: string;
  };
  summary: SessionSummary;
}): PostSessionStoryViewModel {
  const hasPersonalBest = input.personalBest?.isPersonalBest === true;
  return {
    degradedWarnings: input.degradedWarnings ?? input.degradedSystems ?? [],
    grade: input.ledger.grade,
    headline: hasPersonalBest
      ? {
          type: 'personal_best',
          title: `Personal best. ${input.personalBest!.purityScore} purity in ${input.personalBest!.sessionMode}.`,
        }
      : {
          type: 'xp_earned',
          value: `+${input.ledger.xpDelta} XP`,
        },
    ledgerId: input.ledger.ledgerId,
    newlyUnlockedFeatures: input.newlyUnlockedFeatures ?? [],
    personalBestProof: hasPersonalBest
      ? {
          achievedAt: input.personalBest!.achievedAt,
          durationBucket: input.personalBest!.durationBucket,
          mode: input.personalBest!.sessionMode,
          newValue: input.personalBest!.purityScore,
          oldValue: input.personalBest!.previousBest,
        }
      : undefined,
    sessionId: input.ledger.sessionId,
    summary: input.summary,
    xpDelta: input.ledger.xpDelta,
  };
}