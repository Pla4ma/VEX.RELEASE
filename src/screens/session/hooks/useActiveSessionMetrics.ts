import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Easing,
  runOnJS,
  useAnimatedReaction,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { getStreakMultiplier } from '../../../features/streaks/service';
import type { SessionTheme } from '../../../features/themes/session-themes';
import type { SessionHistoryEntry } from '../../../session/types';
import { vexFire } from '../../../theme/tokens/vex-fire';
import { useSessionAnimations } from './useSessionAnimations';
import { useSessionPurity } from './useSessionPurity';
import {
  clamp,
  DAILY_GOAL_SECONDS,
  getGradientPalette,
  getPhaseInfo,
  getVisualStateIndex,
  type GradientState,
  type PurityLabel,
  withAlpha,
} from '../utils/active-session';
type UseActiveSessionMetricsParams = {
  completionPercentage: number;
  elapsedSeconds: number;
  getAntiCheatLabel: () => PurityLabel;
  getAntiCheatScore: () => number;
  heroDensity?: 'minimal' | 'standard' | 'rich';
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
  sessionTheme: _sessionTheme,
  streakDays,
  heroDensity,
}: UseActiveSessionMetricsParams) {
  const streakMultiplier = getStreakMultiplier(streakDays);

  const {
    momentumScores,
    perfectFocusActive,
    perfectFocusBurst,
    purityLabel,
    purityScore,
    rotatingPerfectFocusStyle,
  } = useSessionPurity({
    completionPercentage,
    getAntiCheatLabel,
    getAntiCheatScore,
    heroDensity,
    sessionId,
    streakMultiplier,
  });

  const phaseAccent =
    phase === 'SHORT_BREAK' || phase === 'LONG_BREAK'
      ? vexFire.success
      : purityLabel === 'Distracted' || purityLabel === 'Okay'
        ? vexFire.amber
        : purityLabel === 'Good'
          ? vexFire.success
          : vexFire.ember;
  const labelColor =
    purityLabel === 'Elite'
      ? vexFire.ember
      : purityLabel === 'Good'
        ? vexFire.success
        : purityLabel === 'Okay'
          ? vexFire.amber
          : vexFire.danger;
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
      (total, entry) =>
        entry.startedAt >= dayStart.getTime()
          ? total + (entry.summary?.effectiveDuration ?? 0)
          : total,
      0,
    );
    return (historical || 0) + (phase === 'FOCUS' ? elapsedSeconds || 0 : 0);
  }, [elapsedSeconds, history, phase]);
  const animations = useSessionAnimations({
    completionPercentage,
    purityScore,
    isActive,
    isPaused,
  });

  const [gradientState, setGradientState] = useState<GradientState>({
    top: vexFire.background,
    middle: vexFire.backgroundRaised,
    bottom: vexFire.background,
  });
  const visualState = useSharedValue(2);

  useEffect(() => {
    if (heroDensity === 'minimal') {return;}
    visualState.value = withTiming(getVisualStateIndex(phase, purityLabel), {
      duration: 450,
      easing: Easing.out(Easing.cubic),
    });
  }, [phase, purityLabel, visualState, heroDensity]);

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
    },
  );

  return {
    dailyProgress: clamp(
      ((todayFocusSeconds || 0) / (DAILY_GOAL_SECONDS || 7200)) * 100,
      0,
      100,
    ),
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
