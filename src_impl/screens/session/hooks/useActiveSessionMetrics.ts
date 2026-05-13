import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Easing,
  cancelAnimation,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { eventBus } from '../../../events';
import { getStreakMultiplier } from '../../../features/streaks/service';
import type { SessionTheme } from '../../../features/themes/session-themes';
import type { SessionHistoryEntry } from '../../../session/types';
import { useTheme } from '../../../theme';
import { useSessionAnimations } from './useSessionAnimations';
import { clamp, DAILY_GOAL_SECONDS, getGradientPalette, getPhaseInfo, getVisualStateIndex, type GradientState, type PurityLabel, withAlpha } from '../utils/active-session';

type UseActiveSessionMetricsParams = {
  completionPercentage: number;
  elapsedSeconds: number;
  getAntiCheatLabel: () => PurityLabel;
  getAntiCheatScore: () => number;
  history: SessionHistoryEntry[];
  isActive: boolean;
  isPaused: boolean;
  phase: string | undefined;
  sessionId: string | undefined;
  sessionTheme: SessionTheme;
  streakDays: number;
};

export function useActiveSessionMetrics({
  completionPercentage,
  elapsedSeconds,
  getAntiCheatLabel,
  getAntiCheatScore,
  history,
  isActive,
  isPaused,
  phase,
  sessionId,
  sessionTheme,
  streakDays,
}: UseActiveSessionMetricsParams) {
  const { theme } = useTheme();
  const [purityScore, setPurityScore] = useState(100);
  const [purityLabel, setPurityLabel] = useState<PurityLabel>('Elite');
  const [perfectFocusEligible, setPerfectFocusEligible] = useState(true);
  const [momentumScores, setMomentumScores] = useState<number[]>([]);
  const [gradientState, setGradientState] = useState<GradientState>({
    top: theme.colors.background.primary,
    middle: theme.colors.background.secondary,
    bottom: theme.colors.background.primary,
  });
  const previousPurityLabelRef = useRef<PurityLabel>('Elite');
  const perfectFocusTrackedRef = useRef(false);
  const perfectFocusBurstRef = useRef(false);
  const momentumScoresRef = useRef<number[]>([]);
  const visualState = useSharedValue(2);
  const perfectFocusRotation = useSharedValue(0);
  const perfectFocusBurst = useSharedValue(0);
  const streakMultiplier = getStreakMultiplier(streakDays);
  const perfectFocusActive = completionPercentage >= 100 && perfectFocusEligible;
  const phaseAccent =
    phase === 'SHORT_BREAK' || phase === 'LONG_BREAK'
      ? theme.colors.success.DEFAULT
      : purityLabel === 'Distracted' || purityLabel === 'Okay'
        ? theme.colors.warning.DEFAULT
        : purityLabel === 'Good'
          ? theme.colors.success.DEFAULT
          : sessionTheme.previewColor;
  const labelColor =
    purityLabel === 'Elite'
      ? theme.colors.primary[500]
      : purityLabel === 'Good'
        ? theme.colors.success.DEFAULT
        : purityLabel === 'Okay'
          ? theme.colors.warning.DEFAULT
          : theme.colors.error.DEFAULT;
  const glowStyle = useMemo(
    () => ({
      shadowColor: phaseAccent,
      shadowOpacity: purityScore >= 90 ? 0.6 : purityScore < 45 ? 0.1 : 0.3,
      shadowRadius: purityScore >= 90 ? 25 : purityScore < 45 ? 5 : 14,
      elevation: purityScore >= 90 ? 12 : 4,
    }),
    [phaseAccent, purityScore],
  );
  const todayFocusSeconds = useMemo(() => {
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    const historical = (history || []).reduce(
      (total, entry) => (entry.startedAt >= dayStart.getTime() ? total + (entry.summary?.effectiveDuration ?? 0) : total),
      0,
    );
    return (historical || 0) + (phase === 'FOCUS' ? (elapsedSeconds || 0) : 0);
  }, [elapsedSeconds, history, phase]);
  const animations = useSessionAnimations({ completionPercentage, purityScore, isActive, isPaused });

  useEffect(() => {
    setPerfectFocusEligible(true);
    setPurityScore(100);
    setPurityLabel('Elite');
    setMomentumScores([]);
    momentumScoresRef.current = [];
    previousPurityLabelRef.current = 'Elite';
    perfectFocusTrackedRef.current = false;
    perfectFocusBurstRef.current = false;
  }, [sessionId]);

  useEffect(() => {
    const syncPurity = () => {
      const nextScore = getAntiCheatScore();
      const nextLabel = getAntiCheatLabel();
      setPurityScore(nextScore);
      setPurityLabel(nextLabel);
      momentumScoresRef.current = [...momentumScoresRef.current, nextScore].slice(-10);
      setMomentumScores(momentumScoresRef.current);
      if (nextScore < 90) {setPerfectFocusEligible(false);}
    };
    syncPurity();
    const intervalId = setInterval(syncPurity, 5000);
    return () => clearInterval(intervalId);
  }, [getAntiCheatLabel, getAntiCheatScore]);

  useEffect(() => {
    visualState.value = withTiming(getVisualStateIndex(phase, purityLabel), {
      duration: 450,
      easing: Easing.out(Easing.cubic),
    });
  }, [phase, purityLabel, visualState]);

  const updateGradientState = useCallback((value: number) => {
    setGradientState(getGradientPalette(value));
  }, []);

  useAnimatedReaction(
    () => visualState.value,
    (value, previousValue) => {
      if (value === previousValue) {
        return;
      }
      runOnJS(updateGradientState)(value);
    }
  );

  useEffect(() => {
    if (!sessionId || previousPurityLabelRef.current === purityLabel) {return;}
    eventBus.publish('analytics:track', {
      event: 'session_purity_changed',
      properties: { sessionId, purityScore, purityLabel, previousPurityLabel: previousPurityLabelRef.current, streakMultiplier },
    });
    previousPurityLabelRef.current = purityLabel;
  }, [purityLabel, purityScore, sessionId, streakMultiplier]);

  useEffect(() => {
    if (!sessionId || !perfectFocusActive || perfectFocusTrackedRef.current) {return;}
    perfectFocusTrackedRef.current = true;
    eventBus.publish('analytics:track', {
      event: 'session_perfect_focus_earned',
      properties: { sessionId, purityScore, streakMultiplier },
    });
  }, [perfectFocusActive, purityScore, sessionId, streakMultiplier]);

  useEffect(() => {
    if (!perfectFocusActive) {
      perfectFocusBurstRef.current = false;
      cancelAnimation(perfectFocusRotation);
      perfectFocusRotation.value = 0;
      return;
    }
    perfectFocusRotation.value = 0;
    perfectFocusRotation.value = withRepeat(withTiming(1, { duration: 5000, easing: Easing.linear }), -1, false);
    if (!perfectFocusBurstRef.current) {
      perfectFocusBurstRef.current = true;
      perfectFocusBurst.value = withSequence(
        withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 350, easing: Easing.in(Easing.quad) }),
      );
    }
  }, [perfectFocusActive, perfectFocusBurst, perfectFocusRotation]);

  const rotatingPerfectFocusStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${perfectFocusRotation.value * 360}deg` }],
  }));

  return {
    dailyProgress: clamp(((todayFocusSeconds || 0) / (DAILY_GOAL_SECONDS || 7200)) * 100, 0, 100),
    glowStyle,
    gradientState,
    labelColor,
    momentumScores,
    perfectFocusActive,
    perfectFocusBurst,
    phaseAccent,
    phaseInfo: getPhaseInfo(phase),
    purityLabel,
    purityScore,
    rotatingPerfectFocusStyle,
    streakMultiplier,
    todayFocusSeconds,
    withAlpha,
    ...animations,
  };
}

export * from "./useActiveSessionMetrics.types";
