import * as Sentry from '@sentry/react-native';
import { z } from 'zod';

import { SessionSummarySchema } from '../../session/types';
import { checkAndUpdatePersonalBest } from '../personal-bests/service';
import { buildCompletionLedger } from './ledger-service';

export type CompletionPersonalBestResult = {
  achievedAt?: string;
  durationBucket?: string;
  isPersonalBest: boolean;
  previousBest?: number | null;
  purityScore?: number;
  sessionMode?: string;
};

export async function resolveCompletionPersonalBest(
  userId: string,
  ledger: ReturnType<typeof buildCompletionLedger>,
  summary: z.infer<typeof SessionSummarySchema>,
): Promise<CompletionPersonalBestResult> {
  try {
    const comparison = await checkAndUpdatePersonalBest(
      userId,
      ledger.mode === 'UNKNOWN' ? summary.sessionMode : ledger.mode,
      ledger.targetDurationSeconds,
      summary.focusPurityScore ?? ledger.qualityScore,
      ledger.grade,
    );
    return {
      achievedAt: comparison.current?.achievedAt,
      durationBucket: comparison.current?.durationBucket,
      isPersonalBest: comparison.isNewRecord,
      previousBest: comparison.previousBest,
      purityScore: comparison.current?.bestPurityScore,
      sessionMode: comparison.current?.sessionMode,
    };
  } catch (error) {
    Sentry.captureException(error, {
      tags: { feature: 'personal-bests', operation: 'completion-check' },
    });
    return { isPersonalBest: false };
  }
}
