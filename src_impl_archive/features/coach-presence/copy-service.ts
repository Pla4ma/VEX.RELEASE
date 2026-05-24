import { z } from 'zod';
import type { CoachPresenceMotivationStyle } from './schemas';

const CoachPresenceContextSchema = z.object({
  motivationStyle: z.enum(['CALM', 'FRIENDLY', 'STUDY_FOCUSED', 'GAME_LIKE', 'COACH_LED', 'INTENSE']),
  primaryGoal: z.enum(['focus', 'study', 'work', 'creative', 'personal', 'learning']),
  firstWeekStage: z.string().min(1).nullable(),
  latestSession: z.object({
    durationMinutes: z.number().int().min(0),
    focusPurityScore: z.number().min(0).max(100),
    mode: z.string().min(1),
    isComeback: z.boolean(),
  }).nullable(),
  comebackState: z.enum(['none', 'missed_1_day', 'missed_2_3_days', 'missed_week', 'returning_after_long_gap']).nullable(),
  studyLayerLabel: z.string().min(1).nullable(),
  bossIntensity: z.enum(['hidden', 'subtle', 'tiny_tease', 'visible', 'standard', 'game-like', 'intense']).nullable(),
  completionContext: z.enum(['first_session', 'comeback', 'streak_recovery', 'high_focus', 'low_energy', 'study', 'short', 'long', 'normal']).nullable(),
  premiumMoment: z.enum(['none', 'soft_tease', 'weekly_value', 'hidden', 'session_value', 'advanced_study', 'weekly_intelligence', 'custom_identity']).nullable(),
  aiAvailable: z.boolean(),
}).strict();

const CoachPresenceMessageOutputSchema = z.object({
  message: z.string().min(1).max(96),
  tone: z.enum(['calm', 'warm', 'direct', 'playful', 'sharp', 'studious']),
  visualMood: z.enum(['steady', 'focused', 'celebrating', 'recovering', 'ready']),
  safeIntent: z.enum(['START_SESSION', 'START_STUDY_SESSION', 'REVIEW_PROGRESS', 'TAKE_BREAK', 'CONTINUE_PLAN', 'REFLECT']),
  optionalActionLabel: z.string().min(1).max(32).nullable(),
}).strict();

export type CoachPresenceContext = z.infer<typeof CoachPresenceContextSchema>;
export type CoachPresenceMessageOutput = z.infer<typeof CoachPresenceMessageOutputSchema>;

type ToneResult = CoachPresenceMessageOutput['tone'];
type MoodResult = CoachPresenceMessageOutput['visualMood'];
type IntentResult = CoachPresenceMessageOutput['safeIntent'];

const TONE_MAP: Record<CoachPresenceMotivationStyle, ToneResult> = {
  CALM: 'calm',
  FRIENDLY: 'warm',
  COACH_LED: 'direct',
  GAME_LIKE: 'playful',
  INTENSE: 'sharp',
  STUDY_FOCUSED: 'studious',
};

const MOOD_MAP: Record<CoachPresenceMotivationStyle, MoodResult> = {
  CALM: 'steady',
  FRIENDLY: 'focused',
  COACH_LED: 'ready',
  GAME_LIKE: 'celebrating',
  INTENSE: 'ready',
  STUDY_FOCUSED: 'steady',
};

function resolveIntent(ctx: CoachPresenceContext): IntentResult {
  if (ctx.completionContext === 'comeback' || ctx.comebackState && ctx.comebackState !== 'none') {
    return ctx.primaryGoal === 'study' || ctx.primaryGoal === 'learning' ? 'START_STUDY_SESSION' : 'START_SESSION';
  }
  if (ctx.primaryGoal === 'study' || ctx.primaryGoal === 'learning') return 'START_STUDY_SESSION';
  return 'START_SESSION';
}

function resolveActionLabel(ctx: CoachPresenceContext): string | null {
  if (ctx.primaryGoal === 'study' || ctx.primaryGoal === 'learning') return 'Next study block';
  if (ctx.completionContext === 'low_energy') return 'Take a break';
  if (ctx.comebackState && ctx.comebackState !== 'none') return 'Start small';
  return 'Start focus';
}

function buildMessage(ctx: CoachPresenceContext): string {
  if (!ctx.aiAvailable) {
    return styleMessage(ctx.motivationStyle, {
      CALM: 'Start with the last rhythm that worked. One clean block.',
      COACH_LED: 'Start the saved plan. I will adjust after the block.',
      FRIENDLY: 'Use the saved next step. We will tune it after.',
      GAME_LIKE: 'Run the saved mission. Progress still counts.',
      INTENSE: 'Start the saved target. No drift.',
      STUDY_FOCUSED: 'Use the saved study step. Review first.',
    });
  }

  if (ctx.completionContext === 'first_session') {
    return styleMessage(ctx.motivationStyle, {
      CALM: 'First session is real now. Tomorrow starts with one clean block.',
      COACH_LED: 'First proof logged. Tomorrow, repeat the clean start.',
      FRIENDLY: 'First finish saved. Come back to the next small step.',
      GAME_LIKE: 'First run banked. Tomorrow starts the next mark.',
      INTENSE: 'First proof logged. Repeat it tomorrow.',
      STUDY_FOCUSED: 'First study proof is in. Queue the next review block.',
    });
  }

  if (ctx.completionContext === 'comeback') {
    return 'That return counted. Keep the next block small.';
  }

  if (ctx.completionContext === 'streak_recovery') {
    return 'The chain is breathing again. Protect it next.';
  }

  if (ctx.completionContext === 'high_focus') {
    return 'High-focus rhythm is showing. Use it once more.';
  }

  if (ctx.completionContext === 'low_energy') {
    return 'Low-energy day, still banked. Recover with care.';
  }

  if (ctx.completionContext === 'study') {
    return ctx.motivationStyle === 'STUDY_FOCUSED'
      ? 'Study thread stayed alive. Queue the next review pass.'
      : 'Study block finished. Keep the thread warm.';
  }

  if (ctx.completionContext === 'short') {
    return 'Short block landed. Stack one more easy rep.';
  }

  if (ctx.completionContext === 'long') {
    return 'Long block held. Let the next move be lighter.';
  }

  if (ctx.comebackState && ctx.comebackState !== 'none') {
    return styleMessage(ctx.motivationStyle, {
      CALM: 'You are not behind. Start with one clean session.',
      COACH_LED: 'Reset the rhythm. Twenty minutes is enough.',
      FRIENDLY: 'Come back small. One block is enough.',
      GAME_LIKE: 'The run is not over. One clean block restarts motion.',
      INTENSE: 'No speech. Reset with one block.',
      STUDY_FOCUSED: 'Do one review block before adding new material.',
    });
  }

  if (ctx.premiumMoment && ctx.premiumMoment !== 'none' && ctx.premiumMoment !== 'hidden') {
    return 'Your rhythm is forming. See what VEX Pro can learn from it.';
  }

  return styleMessage(ctx.motivationStyle, {
    CALM: 'Your rhythm is warm. One clean block next.',
    COACH_LED: 'Next rep is clear. Start the block.',
    FRIENDLY: 'The next block has a clear shape. Start there.',
    GAME_LIKE: 'Your streak has a lane. Bank the next block.',
    INTENSE: 'Window is open. Take the block now.',
    STUDY_FOCUSED: 'Your study block is ready. Start there.',
  });
}

function styleMessage(style: CoachPresenceMotivationStyle, messages: Record<CoachPresenceMotivationStyle, string>): string {
  return messages[style];
}

export function getCoachPresenceMessage(rawContext: unknown): CoachPresenceMessageOutput {
  const ctx = CoachPresenceContextSchema.parse(rawContext);
  const message = buildMessage(ctx);
  const tone = TONE_MAP[ctx.motivationStyle];
  const visualMood = MOOD_MAP[ctx.motivationStyle];
  const safeIntent = resolveIntent(ctx);
  const optionalActionLabel = resolveActionLabel(ctx);

  return CoachPresenceMessageOutputSchema.parse({ message, tone, visualMood, safeIntent, optionalActionLabel });
}
