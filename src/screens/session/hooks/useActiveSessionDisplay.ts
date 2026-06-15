import { useMemo, useRef } from 'react';
import { resolveSessionMode } from '../../../session/modes';
import {
  getLanePresentationPolicy,
  useInitialLane,
} from $1../../../features/lane-engine/presentation$1;
import { useReducedMotion } from $1../../../features/lane-engine/presentation$1;
import { useOnboardingStore } from '../../../features/onboarding/store';
import {
  getActiveSessionTargetLabel,
  normalizeActiveSessionGoal,
  normalizeActiveSessionMotivationStyle,
  resolveActiveSessionDisplayPolicy,
  toLaneSessionMode,
} from '../utils/active-session-display-policy';
import { buildActiveSessionHeroViewModel } from '../utils/active-session-hero-view-model';
import type { ActiveSessionDisplayPolicy } from '../utils/active-session-display-policy';
import type { ActiveSessionHeroViewModel } from '../utils/active-session-hero-view-model';

export type UseActiveSessionDisplayInput = {
  dailyProgress: number;
  elapsedSeconds: number;
  completionPercentage: number;
  momentumScores: number[];
  perfectFocusActive: boolean;
  phaseAccent: string;
  phaseIcon: 'clock' | 'target';
  phaseLabel: string;
  purityLabel: 'Elite' | 'Good' | 'Okay' | 'Distracted';
  purityScore: number;
  remainingSeconds: number;
  streakMultiplier: number;
  todayFocusSeconds: number;
  isPaused: boolean;
  showInterruption: boolean;
  sessionConfigSessionMode: unknown;
};

export type UseActiveSessionDisplayResult = {
  displayPolicy: ActiveSessionDisplayPolicy;
  heroViewModel: ActiveSessionHeroViewModel;
};

export function useActiveSessionDisplay(
  input: UseActiveSessionDisplayInput,
): UseActiveSessionDisplayResult {
  const motivationStyle = useOnboardingStore(
    (state) => state.explicitMotivationStyle,
  );
  const primaryGoal = useOnboardingStore((state) => state.goal);
  const chosenLane = useOnboardingStore((state) => state.chosenLane);
  const { isReducedMotion } = useReducedMotion();
  const observedAtRef = useRef(Date.now());
  const currentMode = resolveSessionMode(input.sessionConfigSessionMode);

  const laneProfile = useInitialLane({
    primaryGoal: normalizeActiveSessionGoal(primaryGoal),
    motivationStyle: normalizeActiveSessionMotivationStyle(motivationStyle),
    manualOverride: chosenLane ?? null,
    observedAt: observedAtRef.current,
    sessionMode: toLaneSessionMode(currentMode),
  });

  return useMemo((): UseActiveSessionDisplayResult => {
    const focusStage = input.showInterruption
      ? 'interruption'
      : input.isPaused
        ? 'paused'
        : 'active';
    const displayPolicy = resolveActiveSessionDisplayPolicy({
      bossIntensity: undefined,
      firstWeekStage: undefined,
      focusStage,
      laneProfile,
      motivationStyle: normalizeActiveSessionMotivationStyle(motivationStyle),
      plannedQuizBreakOptedIn: false,
      primaryGoal: normalizeActiveSessionGoal(primaryGoal),
      sessionMode: currentMode,
      studyLayerLabel: getActiveSessionTargetLabel(primaryGoal, currentMode),
    });

    const lanePresentation = getLanePresentationPolicy({
      lane: laneProfile.primaryLane,
      reducedMotion: isReducedMotion,
    });

    const heroViewModel = buildActiveSessionHeroViewModel({
      completionPercentage: input.completionPercentage,
      dailyProgress: input.dailyProgress,
      displayPolicy,
      elapsedSeconds: input.elapsedSeconds,
      isReducedMotion,
      lanePresentation,
      momentumScores: input.momentumScores,
      perfectFocusActive: input.perfectFocusActive,
      phaseAccent: input.phaseAccent,
      phaseIcon: input.phaseIcon,
      phaseLabel: input.phaseLabel,
      purityLabel: input.purityLabel,
      purityScore: input.purityScore,
      remainingSeconds: input.remainingSeconds,
      streakMultiplier: input.streakMultiplier,
      studyTargetLabel: getActiveSessionTargetLabel(primaryGoal, currentMode),
      todayFocusSeconds: input.todayFocusSeconds,
    });

    return { displayPolicy, heroViewModel };
  }, [
    input,
    motivationStyle,
    primaryGoal,
    currentMode,
    laneProfile,
    isReducedMotion,
  ]);
}
