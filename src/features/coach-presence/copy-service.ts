import type {
  CoachMemoryConfidence,
  _CoachPresenceMotivationStyle,
} from './schemas';
import type {
  CoachPresenceContext,
  CoachPresenceMessageOutput,
} from './copy-schemas';
import {
  CoachPresenceContextSchema,
  CoachPresenceMessageOutputSchema,
  TONE_MAP,
  MOOD_MAP,
} from './copy-schemas';
import { buildMessage } from './copy-messages';
export type {
  CoachPresenceContext,
  CoachPresenceMessageOutput,
} from './copy-schemas';

function resolveIntent(
  ctx: CoachPresenceContext,
): CoachPresenceMessageOutput['safeIntent'] {
  if (ctx.completionContext === 'low_energy') {return 'TAKE_BREAK';}
  if (ctx.primaryGoal === 'study' || ctx.primaryGoal === 'learning')
    {return 'START_STUDY_SESSION';}
  return 'START_SESSION';
}

function resolveActionLabel(ctx: CoachPresenceContext): string | null {
  if (ctx.completionContext === 'low_energy') {return 'Take a break';}
  if (ctx.comebackState && ctx.comebackState !== 'none') {return 'Start small';}
  if (ctx.primaryGoal === 'study' || ctx.primaryGoal === 'learning')
    {return 'Next study block';}
  return 'Start focus';
}

function getDisplayMode(
  ctx: CoachPresenceContext,
): CoachPresenceMessageOutput['displayMode'] {
  if (ctx.sessionMode === 'active_focus' && ctx.motivationStyle === 'CALM')
    {return 'quiet';}
  if (ctx.sessionMode === 'active_paused' || ctx.sessionMode === 'active_risk')
    {return 'intervention';}
  if (ctx.memoryConfidence === 'none') {return 'welcome';}
  if (ctx.memoryConfidence === 'weak') {return 'reflection';}
  return 'pattern';
}

function getConfidence(sessionCount: number): CoachMemoryConfidence {
  if (sessionCount <= 0) {return 'none';}
  if (sessionCount < 3) {return 'weak';}
  if (sessionCount < 5) {return 'medium';}
  return 'strong';
}

export function getCoachMemoryConfidence(
  sessionCount: number,
  syncAvailable: boolean,
): CoachMemoryConfidence {
  if (!syncAvailable) {return 'none';}
  return getConfidence(sessionCount);
}

export function getCoachPresenceMessage(
  rawContext: unknown,
): CoachPresenceMessageOutput {
  const ctx = CoachPresenceContextSchema.parse(rawContext);
  const displayMode = getDisplayMode(ctx);
  const behaviorAdaptation = resolveBehaviorAdaptation(ctx);
  return CoachPresenceMessageOutputSchema.parse({
    message: buildMessage(ctx),
    tone: TONE_MAP[ctx.motivationStyle],
    visualMood: MOOD_MAP[ctx.motivationStyle],
    safeIntent: resolveIntent(ctx),
    optionalActionLabel: resolveActionLabel(ctx),
    shouldShow: displayMode !== 'quiet',
    displayMode,
    behaviorAdaptation,
  });
}

function resolveBehaviorAdaptation(
  ctx: CoachPresenceContext,
): string | null {
  if (ctx.memoryConfidence === 'none') {
    return 'VEX is still learning from your sessions.';
  }
  if (ctx.latestSession && ctx.latestSession.durationMinutes < 15) {
    return 'Your last sessions were short. VEX will keep blocks small.';
  }
  if (ctx.completionContext === 'comeback') {
    return 'VEX noticed you came back after a gap. Starting small.';
  }
  if (
    ctx.memoryConfidence === 'medium' &&
    ctx.latestSession &&
    ctx.latestSession.durationMinutes >= 25
  ) {
    return 'Your session rhythm is forming. VEX is learning your pace.';
  }
  return null;
}
