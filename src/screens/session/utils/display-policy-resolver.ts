import { SessionMode } from '../../../session/modes';
import {
  ActiveSessionDisplayPolicyInputSchema,
  ActiveSessionDisplayPolicySchema,
  type ActiveSessionDisplayPolicyInput,
  type ActiveSessionDisplayPolicy,
} from './display-policy-schemas';

function isStudyInput(input: ActiveSessionDisplayPolicyInput): boolean {
  if (input.laneProfile) {return input.laneProfile.primaryLane === 'student';}
  return (
    input.sessionMode === SessionMode.STUDY ||
    input.motivationStyle === 'study_focused' ||
    input.primaryGoal === 'study' ||
    input.primaryGoal === 'learning'
  );
}

function isGameLikeInput(input: ActiveSessionDisplayPolicyInput): boolean {
  if (input.laneProfile) {return input.laneProfile.primaryLane === 'game_like';}
  return (
    input.motivationStyle === 'game_like' || input.motivationStyle === 'intense'
  );
}

function isCleanInput(input: ActiveSessionDisplayPolicyInput): boolean {
  if (input.laneProfile)
    {return input.laneProfile.primaryLane === 'minimal_normal';}
  return (
    input.motivationStyle === 'calm' &&
    input.primaryGoal !== 'study' &&
    input.primaryGoal !== 'learning'
  );
}

function isProjectInput(input: ActiveSessionDisplayPolicyInput): boolean {
  if (input.laneProfile)
    {return input.laneProfile.primaryLane === 'deep_creative';}
  return (
    input.sessionMode === SessionMode.CREATIVE &&
    input.motivationStyle !== 'game_like' &&
    input.motivationStyle !== 'intense'
  );
}

export function resolveActiveSessionDisplayPolicy(
  rawInput: ActiveSessionDisplayPolicyInput,
): ActiveSessionDisplayPolicy {
  const input = ActiveSessionDisplayPolicyInputSchema.parse(rawInput);
  const isPausedOrInterrupted =
    input.focusStage === 'paused' || input.focusStage === 'interruption';
  const isActiveFocus = input.focusStage === 'active';
  const isStudy = isStudyInput(input);
  const isGameLike = isGameLikeInput(input);
  const isClean = isCleanInput(input);
  const isProject = isProjectInput(input);
  const bossVisible = input.bossIntensity !== 'hidden';
  const plannedQuizBreakVisible =
    isStudy && input.plannedQuizBreakOptedIn === true && isPausedOrInterrupted;

  return ActiveSessionDisplayPolicySchema.parse({
    heroDensity: isPausedOrInterrupted
      ? 'standard'
      : isClean
        ? 'minimal'
        : isProject
          ? 'minimal'
          : isGameLike
            ? 'standard'
            : 'minimal',
    showBossHUD: false,
    showBossTinyIndicator: isGameLike && bossVisible && isActiveFocus,
    showCoachBanner:
      isPausedOrInterrupted &&
      (input.motivationStyle === 'coach_led' || isClean),
    showCompanionLayer: isPausedOrInterrupted && !isStudy && !isClean,
    showContractReminder: isPausedOrInterrupted && !isClean,
    showDailyProgress: isPausedOrInterrupted && !isClean,
    showModeOverlay: plannedQuizBreakVisible,
    showMomentumScore: isGameLike && isPausedOrInterrupted,
    showPurityScore: false,
    showStudyTarget: isStudy && isActiveFocus,
  });
}
