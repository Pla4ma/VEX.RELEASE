import { z } from 'zod';
import { SessionMode } from '../../../session/modes';
import { LaneProfileSchema } from '../../../features/lane-engine/schemas';

const MotivationStyleSchema = z.enum([
  'calm',
  'friendly',
  'coach_led',
  'study_focused',
  'game_like',
  'intense',
]);

const PrimaryGoalSchema = z.enum([
  'focus',
  'study',
  'work',
  'creative',
  'personal',
  'learning',
  'personal_growth',
]);

const BossIntensitySchema = z.enum(['hidden', 'subtle', 'tiny_tease', 'visible']);
const FocusStageSchema = z.enum(['active', 'paused', 'interruption', 'completion']);
const HeroDensitySchema = z.enum(['minimal', 'standard', 'rich']);

export const ActiveSessionDisplayPolicyInputSchema = z.object({
  bossIntensity: BossIntensitySchema.nullish(),
  firstWeekStage: z.string().nullish(),
  focusStage: FocusStageSchema,
  laneProfile: LaneProfileSchema.nullish(),
  motivationStyle: MotivationStyleSchema.nullish(),
  plannedQuizBreakOptedIn: z.boolean().optional(),
  primaryGoal: PrimaryGoalSchema.nullish(),
  sessionMode: z.nativeEnum(SessionMode),
  studyLayerLabel: z.string().nullish(),
}).strict();

export const ActiveSessionDisplayPolicySchema = z.object({
  heroDensity: HeroDensitySchema,
  showBossHUD: z.boolean(),
  showBossTinyIndicator: z.boolean(),
  showCoachBanner: z.boolean(),
  showCompanionLayer: z.boolean(),
  showContractReminder: z.boolean(),
  showDailyProgress: z.boolean(),
  showModeOverlay: z.boolean(),
  showMomentumScore: z.boolean(),
  showPurityScore: z.boolean(),
  showStudyTarget: z.boolean(),
}).strict();

export type ActiveSessionDisplayPolicyInput = z.infer<typeof ActiveSessionDisplayPolicyInputSchema>;
export type ActiveSessionDisplayPolicy = z.infer<typeof ActiveSessionDisplayPolicySchema>;

export const COMPLETION_REWARD_EFFECTS = [
  'boss_damage_reveal',
  'xp_explosion',
  'chest_reward_animation',
  'coach_reflection',
];

export function normalizeActiveSessionGoal(
  goal: string | null,
): 'focus' | 'study' | 'work' | 'creative' | 'personal' | 'learning' {
  switch (goal) {
    case 'STUDY':
      return 'study';
    case 'WORK':
      return 'work';
    case 'CREATIVE':
      return 'creative';
    case 'PERSONAL':
      return 'personal';
    case 'LEARNING':
      return 'learning';
    default:
      return 'focus';
  }
}

export function normalizeActiveSessionMotivationStyle(
  style: string | null,
): 'calm' | 'friendly' | 'coach_led' | 'study_focused' | 'game_like' | 'intense' {
  switch (style) {
    case 'friendly':
    case 'coach_led':
    case 'study_focused':
    case 'game_like':
    case 'intense':
      return style;
    case 'student':
      return 'study_focused';
    case 'competitive':
      return 'game_like';
    default:
      return 'calm';
  }
}

export function getActiveSessionTargetLabel(goal: string | null, currentMode: SessionMode): string {
  if (currentMode === SessionMode.STUDY || goal === 'STUDY') {
    return 'Study target';
  }
  if (goal === 'LEARNING') {
    return 'Learning target';
  }
  return 'Session target';
}

/**
 * Maps VEX SessionMode enum to lane-engine's string-based session mode
 * for lane profile resolution. Only the 6 modes lane-engine understands.
 */
export function toLaneSessionMode(mode: SessionMode): "FOCUS" | "STUDY" | "DEEP_WORK" | "SPRINT" | "CREATIVE" | "RECOVERY" | null {
  switch (mode) {
    case SessionMode.STUDY: return "STUDY";
    case SessionMode.DEEP_WORK: return "DEEP_WORK";
    case SessionMode.SPRINT: return "SPRINT";
    case SessionMode.CREATIVE: return "CREATIVE";
    case SessionMode.RECOVERY: return "RECOVERY";
    default: return "FOCUS";
  }
}

function isStudyInput(input: ActiveSessionDisplayPolicyInput): boolean {
  if (input.laneProfile) return input.laneProfile.primaryLane === 'student';
  return input.sessionMode === SessionMode.STUDY ||
    input.motivationStyle === 'study_focused' ||
    input.primaryGoal === 'study' ||
    input.primaryGoal === 'learning';
}

function isGameLikeInput(input: ActiveSessionDisplayPolicyInput): boolean {
  if (input.laneProfile) return input.laneProfile.primaryLane === 'game_like';
  return input.motivationStyle === 'game_like' || input.motivationStyle === 'intense';
}

function isCleanInput(input: ActiveSessionDisplayPolicyInput): boolean {
  if (input.laneProfile) return input.laneProfile.primaryLane === 'minimal_normal';
  return input.motivationStyle === 'calm' &&
    input.primaryGoal !== 'study' &&
    input.primaryGoal !== 'learning';
}

function isProjectInput(input: ActiveSessionDisplayPolicyInput): boolean {
  if (input.laneProfile) return input.laneProfile.primaryLane === 'deep_creative';
  return input.sessionMode === SessionMode.CREATIVE &&
    input.motivationStyle !== 'game_like' &&
    input.motivationStyle !== 'intense';
}

export function resolveActiveSessionDisplayPolicy(
  rawInput: ActiveSessionDisplayPolicyInput,
): ActiveSessionDisplayPolicy {
  const input = ActiveSessionDisplayPolicyInputSchema.parse(rawInput);
  const isPausedOrInterrupted = input.focusStage === 'paused' || input.focusStage === 'interruption';
  const isActiveFocus = input.focusStage === 'active';
  const isStudy = isStudyInput(input);
  const isGameLike = isGameLikeInput(input);
  const isClean = isCleanInput(input);
  const isProject = isProjectInput(input);
  const bossVisible = input.bossIntensity !== 'hidden';
  const plannedQuizBreakVisible = isStudy && input.plannedQuizBreakOptedIn === true && isPausedOrInterrupted;

  return ActiveSessionDisplayPolicySchema.parse({
    heroDensity: isPausedOrInterrupted ? 'standard' : isClean ? 'minimal' : isProject ? 'minimal' : isGameLike ? 'standard' : 'minimal',
    showBossHUD: false,
    showBossTinyIndicator: isGameLike && bossVisible && isActiveFocus,
    showCoachBanner: isPausedOrInterrupted && (input.motivationStyle === 'coach_led' || isClean),
    showCompanionLayer: isPausedOrInterrupted && !isStudy && !isClean,
    showContractReminder: isPausedOrInterrupted && !isClean,
    showDailyProgress: isPausedOrInterrupted && !isClean,
    showModeOverlay: plannedQuizBreakVisible,
    showMomentumScore: isGameLike && isPausedOrInterrupted,
    showPurityScore: false,
    showStudyTarget: isStudy && isActiveFocus,
  });
}
