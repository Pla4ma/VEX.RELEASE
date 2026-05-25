import { z } from 'zod';
import { SessionMode } from '../../../session/modes';

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

function isStudyInput(input: ActiveSessionDisplayPolicyInput): boolean {
  return input.sessionMode === SessionMode.STUDY ||
    input.motivationStyle === 'study_focused' ||
    input.primaryGoal === 'study' ||
    input.primaryGoal === 'learning';
}

function isGameLikeInput(input: ActiveSessionDisplayPolicyInput): boolean {
  return input.motivationStyle === 'game_like' || input.motivationStyle === 'intense';
}

export function resolveActiveSessionDisplayPolicy(
  rawInput: ActiveSessionDisplayPolicyInput,
): ActiveSessionDisplayPolicy {
  const input = ActiveSessionDisplayPolicyInputSchema.parse(rawInput);
  const isPausedOrInterrupted = input.focusStage === 'paused' || input.focusStage === 'interruption';
  const isActiveFocus = input.focusStage === 'active';
  const isStudy = isStudyInput(input);
  const isGameLike = isGameLikeInput(input);
  const bossVisible = input.bossIntensity !== 'hidden';
  const plannedQuizBreakVisible = isStudy && input.plannedQuizBreakOptedIn === true && isPausedOrInterrupted;

  return ActiveSessionDisplayPolicySchema.parse({
    heroDensity: isPausedOrInterrupted ? 'standard' : isGameLike ? 'standard' : 'minimal',
    showBossHUD: false,
    showBossTinyIndicator: isGameLike && bossVisible && isActiveFocus,
    showCoachBanner: isPausedOrInterrupted && input.motivationStyle === 'coach_led',
    showCompanionLayer: isPausedOrInterrupted && !isStudy,
    showContractReminder: isPausedOrInterrupted,
    showDailyProgress: isPausedOrInterrupted,
    showModeOverlay: plannedQuizBreakVisible,
    showMomentumScore: isGameLike && isPausedOrInterrupted,
    showPurityScore: false,
    showStudyTarget: isStudy && isActiveFocus,
  });
}
