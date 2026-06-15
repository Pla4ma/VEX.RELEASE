import { useEffect, useRef, useState } from 'react';
import {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { eventBus } from '../../../events/EventBus';
import type { PurityLabel } from '../utils/active-session';

type UseSessionPurityParams = {
  completionPercentage: number;
  getAntiCheatLabel: () => PurityLabel;
  getAntiCheatScore: () => number;
  heroDensity?: 'minimal' | 'standard' | 'rich';
  sessionId: string | undefined;
  streakMultiplier: number;
};

export function useSessionPurity({
  completionPercentage,
  getAntiCheatLabel,
  getAntiCheatScore,
  heroDensity,
  sessionId,
  streakMultiplier,
}: UseSessionPurityParams) {
  const [purityScore, setPurityScore] = useState(100);
  const [purityLabel, setPurityLabel] = useState<PurityLabel>('Elite');
  const [perfectFocusEligible, setPerfectFocusEligible] = useState(true);
  const [momentumScores, setMomentumScores] = useState<number[]>([]);
  const previousPurityLabelRef = useRef<PurityLabel>('Elite');
  const perfectFocusTrackedRef = useRef(false);
  const perfectFocusBurstRef = useRef(false);
  const momentumScoresRef = useRef<number[]>([]);
  const perfectFocusRotation = useSharedValue(0);
  const perfectFocusBurst = useSharedValue(0);
  const [prevSessionId, setPrevSessionId] = useState(sessionId);

  if (sessionId !== prevSessionId) {
    setPrevSessionId(sessionId);
    setPerfectFocusEligible(true);
    setPurityScore(100);
    setPurityLabel('Elite');
    setMomentumScores([]);
    momentumScoresRef.current = [];
    previousPurityLabelRef.current = 'Elite';
    perfectFocusTrackedRef.current = false;
    perfectFocusBurstRef.current = false;
  }

  const perfectFocusActive =
    completionPercentage >= 100 && perfectFocusEligible;

  useEffect(() => {
    if (heroDensity === 'minimal') {return;}
    const syncPurity = () => {
      const nextScore = getAntiCheatScore();
      const nextLabel = getAntiCheatLabel();
      setPurityScore(nextScore);
      setPurityLabel(nextLabel);
      momentumScoresRef.current = [
        ...momentumScoresRef.current,
        nextScore,
      ].slice(-10);
      setMomentumScores(momentumScoresRef.current);
      if (nextScore < 90) {
        setPerfectFocusEligible(false);
      }
    };
    syncPurity();
    const intervalId = setInterval(syncPurity, 5000);
    return () => clearInterval(intervalId);
  }, [getAntiCheatLabel, getAntiCheatScore, heroDensity]);

  useEffect(() => {
    if (!sessionId || previousPurityLabelRef.current === purityLabel) {
      return;
    }
    eventBus.publish('analytics:track', {
      event: 'session_purity_changed',
      properties: {
        sessionId,
        purityScore,
        purityLabel,
        previousPurityLabel: previousPurityLabelRef.current,
        streakMultiplier,
      },
    });
    previousPurityLabelRef.current = purityLabel;
  }, [purityLabel, purityScore, sessionId, streakMultiplier]);

  useEffect(() => {
    if (!sessionId || !perfectFocusActive || perfectFocusTrackedRef.current) {
      return;
    }
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
    perfectFocusRotation.value = withRepeat(
      withTiming(1, { duration: 5000, easing: Easing.linear }),
      -1,
      false,
    );
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
    momentumScores,
    perfectFocusActive,
    perfectFocusBurst,
    purityLabel,
    purityScore,
    rotatingPerfectFocusStyle,
  };
}
