import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppState, BackHandler } from 'react-native';
import * as Sentry from '@sentry/react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native'; import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useProgressionSummary } from '../../../features/progression/hooks';
import { getSprintChainService } from '../../../features/session/SprintChainService';
import { useStreak } from '../../../features/streaks/hooks';
import { getSessionThemeById } from '../../../features/themes/session-themes';
import type { SessionStackParams } from '../../../navigation/types';
import type { Mood } from '../../../session/components/CreativeMoodLogger';
import { useSession, useSessionHistory } from '../../../session/hooks/useSession';
import { resolveSessionMode, SessionMode } from '../../../session/modes';
import { useAuthStore } from '../../../store';
import { useTheme } from '../../../theme';
import { buildActiveSessionControlFailure, type ActiveSessionControlFailure } from '../utils/active-session-control-failure';
import { useActiveSessionMetrics } from './useActiveSessionMetrics';
import { useCompanionSession } from './useCompanionSession';
type SessionNavigationProp = NativeStackNavigationProp<SessionStackParams>; type ActiveSessionRouteProp = RouteProp<SessionStackParams, 'ActiveSession'>;
export function useActiveSessionController() {
  const navigation = useNavigation<SessionNavigationProp>();
  const route = useRoute<ActiveSessionRouteProp>();
  const { theme } = useTheme();
  const { user } = useAuthStore();
  const { sessionId, selectedThemeId } = route.params;
  const userId = user?.id ?? '';
  const [dismissDegradedState, setDismissDegradedState] = useState(false);
  const [showInterruption, setShowInterruption] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [showMultiplierInfo, setShowMultiplierInfo] = useState(false);
  const [creativeMood, setCreativeMood] = useState<Mood | null>(null);
  const [controlFailure, setControlFailure] = useState<ActiveSessionControlFailure | null>(null);
  const sessionTheme = useMemo(() => getSessionThemeById(selectedThemeId), [selectedThemeId]);
  const { data: progressionSummary } = useProgressionSummary(userId || null);
  const { data: streak } = useStreak(userId || null);
  const { history } = useSessionHistory(userId || '', 100);
  const sessionQuery = useSession(userId || '');
  const totalSeconds = Math.max(
    sessionQuery.session?.config.duration ?? sessionQuery.elapsedSeconds + sessionQuery.remainingSeconds,
    1,
  );
  const currentMode = resolveSessionMode(sessionQuery.session?.config.sessionMode);
  const companion = useCompanionSession({
    currentMode,
    elapsedSeconds: sessionQuery.elapsedSeconds,
    isPaused: sessionQuery.isPaused,
    purityScore: sessionQuery.getAntiCheatScore(),
    sessionId,
    totalSeconds,
    userId,
  });
  const isDegradedSession =
    (sessionQuery.session?.status === 'DEGRADED' || sessionQuery.session?.storageStatus === 'DEGRADED') &&
    !dismissDegradedState;
  const metrics = useActiveSessionMetrics({
    completionPercentage: sessionQuery.completionPercentage,
    elapsedSeconds: sessionQuery.elapsedSeconds,
    getAntiCheatLabel: sessionQuery.getAntiCheatLabel,
    getAntiCheatScore: sessionQuery.getAntiCheatScore,
    history,
    isActive: sessionQuery.isActive,
    isPaused: sessionQuery.isPaused,
    phase: sessionQuery.session?.phase,
    sessionId: sessionQuery.session?.id,
    sessionTheme,
    streakDays: streak?.currentDays ?? 0,
  });
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isExiting) return false;
      setShowInterruption(true);
      return true;
    });
    return () => backHandler.remove();
  }, [isExiting]);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (!sessionQuery.session?.id || !sessionQuery.isActive) return;
      const action =
        nextState === 'background' || nextState === 'inactive'
          ? sessionQuery.backgroundSession
          : nextState === 'active'
            ? sessionQuery.foregroundSession
            : null;
      action?.().catch((caught) => {
        Sentry.captureException(caught, {
          tags: { feature: nextState === 'active' ? 'session-foreground' : 'session-background' },
        });
      });
    });
    return () => subscription.remove();
  }, [sessionQuery]);
  useEffect(
    () => () => {
      if (!sessionQuery.session?.id || !sessionQuery.isActive) return;
      sessionQuery.backgroundSession().catch((caught) => {
        Sentry.captureException(caught, { tags: { feature: 'session-background-unmount' } });
      });
    },
    [sessionQuery],
  );
  const handlePauseResume = useCallback(async (): Promise<void> => {
    try {
      if (sessionQuery.isPaused) {
        await sessionQuery.resumeSession();
        setControlFailure(null);
        Sentry.addBreadcrumb({ category: 'session', message: 'Session resumed', level: 'info' });
        return;
      }
      await sessionQuery.pauseSession('user');
      setControlFailure(null);
      Sentry.addBreadcrumb({ category: 'session', message: 'Session paused', level: 'info' });
    } catch (caught) {
      setControlFailure(buildActiveSessionControlFailure('pause'));
      Sentry.captureException(caught, { tags: { feature: 'session-control' } });
    }
  }, [sessionQuery]);
  const handleComplete = useCallback(async (): Promise<void> => {
    try {
      const finalPurityScore = sessionQuery.getAntiCheatScore();
      const result = await sessionQuery.endSession();
      let sprintChainCount = sessionQuery.session?.config.sprintChainCount ?? 1;
      if (currentMode === SessionMode.SPRINT) {
        const sprintState = await getSprintChainService().recordSprintCompleted(userId);
        sprintChainCount = sprintState.completedCount;
      }
      await companion.completeCompanionSession({ ...result, focusPurityScore: finalPurityScore });
      setControlFailure(null);
      Sentry.addBreadcrumb({ category: 'session', message: 'Session completed', level: 'info' });
      navigation.navigate('SessionComplete', {
        sessionId,
        summary: {
          ...result,
          focusPurityScore: finalPurityScore,
          sprintChainCount,
          userLevel: progressionSummary?.level ?? result.userLevel ?? 1,
          creativeMood: creativeMood ?? undefined,
        },
      });
    } catch (caught) {
      setControlFailure(buildActiveSessionControlFailure('complete'));
      Sentry.captureException(caught, { tags: { feature: 'session-complete' } });
    }
  }, [companion, creativeMood, currentMode, navigation, progressionSummary?.level, sessionId, sessionQuery, userId]);
  const handleCreativeMoodSelected = useCallback((mood: Mood): void => setCreativeMood(mood), []);
  const handleSkipCreativeMood = useCallback((): void => setCreativeMood(null), []);
  const handleAbandon = useCallback(async (): Promise<void> => {
    setIsExiting(true);
    setShowInterruption(false);
    try {
      await sessionQuery.abandonSession('user');
      setControlFailure(null);
      Sentry.addBreadcrumb({ category: 'session', message: 'Session abandoned', level: 'warning' });
      navigation.goBack();
    } catch (caught) {
      setControlFailure(buildActiveSessionControlFailure('abandon'));
      Sentry.captureException(caught, { tags: { feature: 'session-abandon' } });
      setIsExiting(false);
    }
  }, [navigation, sessionQuery]);
  const retryControlFailure = useCallback(async (): Promise<void> => {
    if (!controlFailure) return;
    if (controlFailure.action === 'complete') {
      await handleComplete();
      return;
    }
    if (controlFailure.action === 'abandon') {
      await handleAbandon();
      return;
    }
    await handlePauseResume();
  }, [controlFailure, handleAbandon, handleComplete, handlePauseResume]);
  const clearControlFailure = useCallback((): void => setControlFailure(null), []);
  return {
    actions: {
      clearControlFailure,
      handleAbandon,
      handleComplete,
      handleCreativeMoodSelected,
      handlePauseResume,
      handleSkipCreativeMood,
      retryControlFailure,
      setDismissDegradedState,
      setShowInterruption,
      setShowMultiplierInfo,
    },
    companion,
    controlFailure,
    isDegradedSession,
    metrics,
    navigation,
    sessionQuery,
    showInterruption,
    showMultiplierInfo,
    streak,
    theme,
    themeBackgroundColor: sessionTheme.backgroundTint === 'transparent' ? theme.colors.background.primary : sessionTheme.backgroundTint,
    userId,
  };
}
