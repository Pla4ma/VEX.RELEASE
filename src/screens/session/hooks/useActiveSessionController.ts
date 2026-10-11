import { useEffect, useMemo, useRef, useState } from 'react';
import { AppState, BackHandler, Platform } from 'react-native';
import * as Sentry from '@sentry/react-native';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useProgressionSummary } from '../../../features/progression/hooks';
import { useStreak } from '../../../features/streaks/hooks';
import { getSessionThemeById } from '../../../features/themes/session-themes';
import type { SessionStackParams } from '../../../navigation/types';
import type { Mood } from '../../../session/components/CreativeMoodLogger';
import {
  useSession,
  useSessionHistory,
} from '../../../session/hooks/useSession';
import { resolveSessionMode } from '../../../session/modes';
import { useAuthStore } from '../../../store';
import { useTheme } from '../../../theme/ThemeContext';
import { vexFire } from '../../../theme/tokens/vex-fire';
import type { ActiveSessionControlFailure } from '../utils/active-session-control-failure';
import { useActiveSessionMetrics } from './useActiveSessionMetrics';
import { useCompanionSession } from './useCompanionSession';
import { useActiveSessionHandlers } from './useActiveSessionHandlers';

type SessionNavigationProp = NativeStackNavigationProp<SessionStackParams>;
type ActiveSessionRouteProp = RouteProp<SessionStackParams, 'ActiveSession'>;

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
  const [controlFailure, setControlFailure] =
    useState<ActiveSessionControlFailure | null>(null);

  const sessionTheme = useMemo(
    () => getSessionThemeById(selectedThemeId),
    [selectedThemeId],
  );
  const { data: progressionSummary } = useProgressionSummary(userId || null);
  const { data: streak } = useStreak(userId || null);
  const { history } = useSessionHistory(userId || '', 100);
  const sessionQuery = useSession(userId || '');
  const totalSeconds = Math.max(
    sessionQuery.session?.config.duration ??
      sessionQuery.elapsedSeconds + sessionQuery.remainingSeconds,
    1,
  );
  const currentMode = resolveSessionMode(
    sessionQuery.session?.config.sessionMode,
  );
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
    (sessionQuery.session?.status === 'DEGRADED' ||
      sessionQuery.session?.storageStatus === 'DEGRADED') &&
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
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (isExiting) {return false;}
        setShowInterruption(true);
        return true;
      },
    );
    return () => backHandler.remove();
  }, [isExiting]);

  useEffect(() => {
    if (Platform.OS === 'web') {return undefined;}
    const subscription = AppState.addEventListener('change', (nextState) => {
      const action =
        nextState === 'background' || nextState === 'inactive'
          ? sessionQuery.backgroundSession
          : nextState === 'active'
            ? sessionQuery.foregroundSession
            : null;
      action?.().catch((caught) => {
        Sentry.captureException(caught, {
          tags: {
            feature:
              nextState === 'active'
                ? 'session-foreground'
                : 'session-background',
          },
        });
      });
    });
    return () => subscription.remove();
  }, [sessionQuery]);

  const backgroundOnUnmountRef = useRef(sessionQuery.backgroundSession);
  backgroundOnUnmountRef.current = sessionQuery.backgroundSession;
  const sessionIdentityRef = useRef({ id: sessionQuery.session?.id, isActive: sessionQuery.isActive });
  sessionIdentityRef.current = { id: sessionQuery.session?.id, isActive: sessionQuery.isActive };

  useEffect(() => {
    return () => {
      const { id, isActive } = sessionIdentityRef.current;
      if (!id || !isActive) {return;}
      backgroundOnUnmountRef.current().catch((caught: unknown) => {
        Sentry.captureException(caught, {
          tags: { feature: 'session-background-unmount' },
        });
      });
    };
  }, []);

  const handlers = useActiveSessionHandlers({
    sessionQuery,
    companion,
    currentMode,
    userId,
    sessionId,
    navigation,
    progressionLevel: progressionSummary?.level,
    creativeMood,
    setCreativeMood,
    setControlFailure,
    setIsExiting,
    setShowInterruption,
  });

  return {
    actions: {
      clearControlFailure: handlers.clearControlFailure,
      handleAbandon: handlers.handleAbandon,
      handleComplete: handlers.handleComplete,
      handleCreativeMoodSelected: handlers.handleCreativeMoodSelected,
      handlePauseResume: handlers.handlePauseResume,
      handleSkipCreativeMood: handlers.handleSkipCreativeMood,
      retryControlFailure: () => handlers.retryControlFailure(controlFailure),
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
    themeBackgroundColor: vexFire.background,
    userId,
  };
}
