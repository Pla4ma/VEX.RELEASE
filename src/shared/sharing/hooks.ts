/**
 * Share Service — React Hooks
 *
 * Wraps share service functions with loading/error state for React components.
 */

import { useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import * as Sentry from '@sentry/react-native';
import { useToast } from '../ui/components/Toast';
import { shareSession, shareAchievement, shareProfile } from './share-service';
import type { SessionShareSummary, ShareResult } from './types';

type UseShareSessionResult = {
  share: (sessionId: string, summary: SessionShareSummary) => void;
  isSharing: boolean;
  error: Error | null;
  result: ShareResult | undefined;
  reset: () => void;
};

export function useShareSession(): UseShareSessionResult {
  const { show } = useToast();
  const mutation = useMutation({
    mutationFn: ({
      sessionId,
      summary,
    }: {
      sessionId: string;
      summary: SessionShareSummary;
    }) => shareSession(sessionId, summary),
    onError: (error) => {
      Sentry.captureException(error, { tags: { feature: 'sharing', operation: 'shareSession' } });
      show({ type: 'error', title: 'Share failed', message: 'Try again when connection returns.' });
    },
  });

  const share = useCallback(
    (sessionId: string, summary: SessionShareSummary) => {
      mutation.mutate({ sessionId, summary });
    },
    [mutation],
  );

  return {
    share,
    isSharing: mutation.isPending,
    error: mutation.error,
    result: mutation.data,
    reset: mutation.reset,
  };
}

type UseShareAchievementResult = {
  share: (achievementId: string, name: string) => void;
  isSharing: boolean;
  error: Error | null;
  result: ShareResult | undefined;
  reset: () => void;
};

export function useShareAchievement(): UseShareAchievementResult {
  const { show } = useToast();
  const mutation = useMutation({
    mutationFn: ({ achievementId, name }: { achievementId: string; name: string }) =>
      shareAchievement(achievementId, name),
    onError: (error) => {
      Sentry.captureException(error, { tags: { feature: 'sharing', operation: 'shareAchievement' } });
      show({ type: 'error', title: 'Share failed', message: 'Try again when connection returns.' });
    },
  });

  const share = useCallback(
    (achievementId: string, name: string) => {
      mutation.mutate({ achievementId, name });
    },
    [mutation],
  );

  return {
    share,
    isSharing: mutation.isPending,
    error: mutation.error,
    result: mutation.data,
    reset: mutation.reset,
  };
}

type UseShareProfileResult = {
  share: (userId: string) => void;
  isSharing: boolean;
  error: Error | null;
  result: ShareResult | undefined;
  reset: () => void;
};

export function useShareProfile(): UseShareProfileResult {
  const { show } = useToast();
  const mutation = useMutation({
    mutationFn: (userId: string) => shareProfile(userId),
    onError: (error) => {
      Sentry.captureException(error, { tags: { feature: 'sharing', operation: 'shareProfile' } });
      show({ type: 'error', title: 'Share failed', message: 'Try again when connection returns.' });
    },
  });

  const share = useCallback(
    (userId: string) => {
      mutation.mutate(userId);
    },
    [mutation],
  );

  return {
    share,
    isSharing: mutation.isPending,
    error: mutation.error,
    result: mutation.data,
    reset: mutation.reset,
  };
}
