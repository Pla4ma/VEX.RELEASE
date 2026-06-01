import {
  NudgeDecisionSchema,
  NudgePolicyInputSchema,
  type NudgeDecision,
  type NudgePolicyInput,
  type NudgeType,
} from './schemas';
import type { Lane } from '../lane-engine/types';
import { laneToCategory, copyFor } from './nudge-copy';

function maxDailyFor(lane: Lane): number {
  return lane === 'minimal_normal' ? 1 : 2;
}

function typeFor(input: NudgePolicyInput, lane: Lane): NudgeType {
  if (input.journeyNudgeType !== undefined) {return input.journeyNudgeType;}

  const paused = input.pausedCategories.includes(laneToCategory(lane));
  if (paused) {return 'none';}

  if (input.context === 'avoidance') {return 'rescue';}
  if (input.context === 'deadline' && lane === 'student')
    {return 'study_deadline';}
  if (input.context === 'project_stale' && lane === 'deep_creative')
    {return 'project_resume';}
  if (input.context === 'run_open' && lane === 'game_like')
    {return 'run_continue';}
  if (input.context === 'weekly_ready') {return 'weekly_insight';}

  return input.completedSessions > 0 ? 'gentle_return' : 'none';
}

function blocked(
  input: NudgePolicyInput,
  budgetRemaining: number,
  reason: string,
): NudgeDecision {
  const lane = input.laneProfile?.primaryLane ?? input.lane;
  return NudgeDecisionSchema.parse({
    allowed: false,
    type: 'none',
    title: null,
    body: null,
    scheduledFor: null,
    reason,
    lane,
    priority: 'low',
    budgetRemaining,
  });
}

/**
 * Check whether current time falls within a user's learned quiet window.
 * Evening dismissals (hour ≥ 18) suppress evening nudges.
 */
function isEveningQuietByBehavior(
  now: number,
  eveningDismissals: number,
): boolean {
  if (eveningDismissals < 2) {return false;}
  const hour = new Date(now).getHours();
  return hour >= 18 || hour < 6;
}

export function decideNudge(rawInput: NudgePolicyInput): NudgeDecision {
  const input = NudgePolicyInputSchema.parse(rawInput);
  const lane = input.laneProfile?.primaryLane ?? input.lane;
  const maxDaily = maxDailyFor(lane);
  const budgetRemaining = Math.max(0, maxDaily - input.sentToday);
  const nudgeType = typeFor(input, lane);

  if (input.userMuted)
    {return blocked(input, budgetRemaining, 'User mute blocks all nudges.');}
  if (input.completedSessions === 0 && !input.manuallyScheduled) {
    return blocked(
      input,
      budgetRemaining,
      'Day 0 has no unsolicited notification.',
    );
  }
  if (input.quietHoursActive && !input.manuallyScheduled) {
    return blocked(input, budgetRemaining, 'Quiet hours block this nudge.');
  }
  if (
    isEveningQuietByBehavior(input.now, input.recentDismissals) &&
    !input.manuallyScheduled &&
    nudgeType !== 'rescue'
  ) {
    return blocked(
      input,
      budgetRemaining,
      'Evening dismissals learned — suppressing non-rescue nudges.',
    );
  }
  if (budgetRemaining <= 0)
    {return blocked(input, budgetRemaining, 'Daily nudge budget reached.');}
  if (input.recentDismissals >= 3) {
    return blocked(
      input,
      budgetRemaining,
      'Repeated dismissals — category paused.',
    );
  }
  if (input.recentDismissals >= 2 && nudgeType !== 'rescue') {
    return blocked(
      input,
      budgetRemaining,
      'Recent dismissals suppress low-trust nudges.',
    );
  }

  const aggressiveTypes: NudgeType[] = [
    'rescue',
    'study_deadline',
    'project_resume',
    'run_continue',
  ];
  const blockedByLowConfidence =
    aggressiveTypes.includes(nudgeType) &&
    !input.manuallyScheduled &&
    input.memoryConfidence !== undefined &&
    input.memoryConfidence < 0.5;

  if (blockedByLowConfidence) {
    return blocked(
      input,
      budgetRemaining,
      `Low-confidence memory (${input.memoryConfidence}) blocks aggressive nudge type ${nudgeType}.`,
    );
  }

  const copy = copyFor(lane, nudgeType);
  return NudgeDecisionSchema.parse({
    allowed: nudgeType !== 'none',
    type: nudgeType,
    title: copy.title,
    body: copy.body,
    scheduledFor: input.now,
    reason: 'Lane policy and budget allow this nudge.',
    lane,
    priority:
      nudgeType === 'study_deadline' || nudgeType === 'rescue'
        ? 'high'
        : 'medium',
    budgetRemaining,
  });
}

export {
  buildRescueDeepLink,
  isRescueDeepLinkValid,
  markExpiredAsIgnored,
} from './nudge-deep-link';
