import { useCallback } from 'react';
import * as Sentry from '@sentry/react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParams } from '../../../navigation/types';
import { getSprintChainService } from '../../../features/session/SprintChainService';
import type { SessionStackParams } from '../../../navigation/types';
import { navigateToSessionStackScreen } from '../../../navigation/navigation-helpers';
import type { Mood } from '../../../session/components/CreativeMoodLogger';
import type {} from '../../../session/types/schemas';
import { SessionSummarySchema } from '../../../session/types/schemas';
import type { useSession } from '../../../session/hooks/useSession';
import { SessionMode } from '../../../session/modes';
import {
  buildActiveSessionControlFailure,
  type ActiveSessionControlFailure,
} from '../utils/active-session-control-failure';
import type { useCompanionSession } from './useCompanionSession';

type SessionNavigationProp = NativeStackNavigationProp<SessionStackParams>;
type SessionQuery = ReturnType<typeof useSession>;
type CompanionQuery = ReturnType<typeof useCompanionSession>;

interface ActiveSessionHandlerDeps {
  sessionQuery: SessionQuery;
  companion: CompanionQuery;
  currentMode: SessionMode;
  userId: string;
  sessionId: string;
  navigation: SessionNavigationProp;
  progressionLevel: number | undefined;
  creativeMood: Mood | null;
  setCreativeMood: (mood: Mood | null) => void;
  setControlFailure: (failure: ActiveSessionControlFailure | null) => void;
  setIsExiting: (value: boolean) => void;
  setShowInterruption: (value: boolean) => void;
}

export function useActiveSessionHandlers({
  sessionQuery,
  companion,
  currentMode,
  userId,
  sessionId,
  navigation,
  progressionLevel,
  creativeMood,
  setCreativeMood,
  setControlFailure,
  setIsExiting,
  setShowInterruption,
}: ActiveSessionHandlerDeps) {
  const handlePauseResume = useCallback(async (): Promise<void> => {
    try {
      if (sessionQuery.isPaused) {
        await sessionQuery.resumeSession();
        setControlFailure(null);
        Sentry.addBreadcrumb({
          category: 'session',
          message: 'Session resumed',
          level: 'info',
        });
        return;
      }
      await sessionQuery.pauseSession('user');
      setControlFailure(null);
      Sentry.addBreadcrumb({
        category: 'session',
        message: 'Session paused',
        level: 'info',
      });
    } catch (caught) {
      setControlFailure(buildActiveSessionControlFailure('pause'));
      Sentry.captureException(caught, { tags: { feature: 'session-control' } });
    }
  }, [sessionQuery, setControlFailure]);

  const handleComplete = useCallback(async (): Promise<void> => {
    try {
      const finalPurityScore = sessionQuery.getAntiCheatScore();
      const result = await sessionQuery.endSession();
      let sprintChainCount = sessionQuery.session?.config.sprintChainCount ?? 1;
      if (currentMode === SessionMode.SPRINT) {
        const sprintState =
          await getSprintChainService().recordSprintCompleted(userId);
        sprintChainCount = sprintState.completedCount;
      }
      await companion.completeCompanionSession({
        ...result,
        focusPurityScore: finalPurityScore,
      });
      setControlFailure(null);
      Sentry.addBreadcrumb({
        category: 'session',
        message: 'Session completed',
        level: 'info',
      });
      navigateToSessionStackScreen(navigation as NavigationProp<RootStackParams>, 'SessionComplete', {
        sessionId,
        summary: SessionSummarySchema.parse({
          ...result,
          focusPurityScore: finalPurityScore,
          sprintChainCount,
          userLevel: progressionLevel ?? result.userLevel ?? 1,
          creativeMood: creativeMood ?? undefined,
        }),
      });
    } catch (caught) {
      setControlFailure(buildActiveSessionControlFailure('complete'));
      Sentry.captureException(caught, {
        tags: { feature: 'session-complete' },
      });
    }
  }, [
    companion,
    creativeMood,
    currentMode,
    navigation,
    progressionLevel,
    sessionId,
    sessionQuery,
    userId,
    setControlFailure,
  ]);

  const handleCreativeMoodSelected = useCallback(
    (mood: Mood): void => setCreativeMood(mood),
    [setCreativeMood],
  );

  const handleSkipCreativeMood = useCallback(
    (): void => setCreativeMood(null),
    [setCreativeMood],
  );

  const handleAbandon = useCallback(async (): Promise<void> => {
    setIsExiting(true);
    setShowInterruption(false);
    try {
      await sessionQuery.abandonSession('user');
      setControlFailure(null);
      Sentry.addBreadcrumb({
        category: 'session',
        message: 'Session abandoned',
        level: 'warning',
      });
      navigation.goBack();
    } catch (caught) {
      setControlFailure(buildActiveSessionControlFailure('abandon'));
      Sentry.captureException(caught, { tags: { feature: 'session-abandon' } });
      setIsExiting(false);
    }
  }, [
    navigation,
    sessionQuery,
    setControlFailure,
    setIsExiting,
    setShowInterruption,
  ]);

  const retryControlFailure = useCallback(
    async (
      controlFailure: ActiveSessionControlFailure | null,
    ): Promise<void> => {
      if (!controlFailure) {return;}
      if (controlFailure.action === 'complete') {
        await handleComplete();
        return;
      }
      if (controlFailure.action === 'abandon') {
        await handleAbandon();
        return;
      }
      await handlePauseResume();
    },
    [handleAbandon, handleComplete, handlePauseResume],
  );

  const clearControlFailure = useCallback(
    (): void => setControlFailure(null),
    [setControlFailure],
  );

  return {
    clearControlFailure,
    handleAbandon,
    handleComplete,
    handleCreativeMoodSelected,
    handlePauseResume,
    handleSkipCreativeMood,
    retryControlFailure,
  };
}
