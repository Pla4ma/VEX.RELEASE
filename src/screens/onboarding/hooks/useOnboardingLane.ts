import { useCallback, useState } from 'react';

import { confirmInitialLane } from '../../../features/lane-engine/service';
import type { Lane, LaneConfirmation } from '../../../features/lane-engine';
import type { MotivationStyle } from '../../../features/personalization/core-schemas';

const GOAL_TO_PRIMARY_MAP: Record<string, string | undefined> = {
  'deep-work': 'work',
  'build-habit': 'focus',
  'get-done': 'work',
  'beat-procrastination': 'personal',
};

const LANE_LABELS: Record<Lane, string> = {
  student: 'Study Mode',
  game_like: 'Run Mode',
  deep_creative: 'Project Mode',
  minimal_normal: 'Clean Mode',
};

export function useOnboardingLane(
  goal: string | undefined,
  motivationStyle: string | undefined,
): {
  laneConfirmation: LaneConfirmation | null;
  chosenLane: Lane | null;
  isChoosingLane: boolean;
  computeLaneConfirmation: () => void;
  handleAcceptLane: (lane: Lane) => void;
  handleChooseAnotherLane: () => void;
  handleSelectLane: (lane: Lane) => void;
} {
  const [laneConfirmation, setLaneConfirmation] =
    useState<LaneConfirmation | null>(null);
  const [chosenLane, setChosenLane] = useState<Lane | null>(null);
  const [isChoosingLane, setIsChoosingLane] = useState(false);

  const computeLaneConfirmation = useCallback((): void => {
    if (laneConfirmation) {return;}
    const primaryGoal = goal ? GOAL_TO_PRIMARY_MAP[goal] : undefined;
    const confirmation = confirmInitialLane({
      primaryGoal: primaryGoal as Parameters<
        typeof confirmInitialLane
      >[0]['primaryGoal'],
      motivationStyle: (motivationStyle as MotivationStyle) ?? undefined,
    });
    setLaneConfirmation(confirmation);
  }, [goal, motivationStyle, laneConfirmation]);

  const handleAcceptLane = useCallback((lane: Lane): void => {
    setChosenLane(lane);
  }, []);

  const handleChooseAnotherLane = useCallback((): void => {
    setIsChoosingLane(true);
  }, []);

  const handleSelectLane = useCallback((lane: Lane): void => {
    setChosenLane(lane);
    setLaneConfirmation({
      recommendedLane: lane,
      userFacingName: LANE_LABELS[lane],
      reason: 'VEX thinks this fits how you work. You can change this anytime.',
      confidence: 1,
      canChangeLater: true,
    });
    setIsChoosingLane(false);
  }, []);

  return {
    laneConfirmation,
    chosenLane,
    isChoosingLane,
    computeLaneConfirmation,
    handleAcceptLane,
    handleChooseAnotherLane,
    handleSelectLane,
  };
}
