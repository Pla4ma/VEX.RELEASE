import { useEffect, useState } from 'react';
import * as Sentry from '@sentry/react-native';
import type { SessionSummary } from '../../session/types';
import { detectNewlyUnlockedFeatures } from './completion-personalization-step';

export function useSessionCompletionConsequences(input?: {
  summary: SessionSummary;
  userId: string | null;
}): { newlyUnlockedFeatures: string[] } {
  const userId = input?.userId ?? null;
  const summary = input?.summary;
  const [resolved, setResolved] = useState<{
    features: string[];
    summary: SessionSummary;
    userId: string;
  } | null>(null);

  useEffect(() => {
    if (!userId || !summary) {
      setResolved(null);
      return;
    }
    let isCurrent = true;
    void detectNewlyUnlockedFeatures(userId, summary)
      .then((features) => {
        if (isCurrent) {
          setResolved({ features, summary, userId });
        }
      })
      .catch((error: unknown) => {
        Sentry.captureException(error, {
          tags: { feature: 'completion-unlock-detection' },
        });
      });
    return () => {
      isCurrent = false;
    };
  }, [summary, userId]);

  const newlyUnlockedFeatures =
    resolved && resolved.summary === summary && resolved.userId === userId
      ? resolved.features
      : [];
  return { newlyUnlockedFeatures };
}
