import {
  NudgeDecisionSchema,
  NudgePolicyInputSchema,
  type NudgeDecision,
  type NudgePolicyInput,
  type NudgeType,
} from './schemas';
import type { Lane } from '../lane-engine/types';

function maxDailyFor(lane: Lane): number {
  return lane === 'minimal_normal' ? 1 : 2;
}

function typeFor(input: NudgePolicyInput): NudgeType {
  if (input.context === 'avoidance') return 'rescue';
  if (input.context === 'deadline' && input.lane === 'student') return 'study_deadline';
  if (input.context === 'project_stale' && input.lane === 'deep_creative') return 'project_resume';
  if (input.context === 'run_open' && input.lane === 'game_like') return 'run_continue';
  if (input.context === 'weekly_ready') return 'weekly_insight';
  return input.completedSessions > 0 ? 'gentle_return' : 'none';
}

function copyFor(lane: Lane, type: NudgeType): Pick<NudgeDecision, 'body' | 'title'> {
  if (type === 'none') return { title: null, body: null };
  if (type === 'rescue') return { title: 'Start smaller', body: 'A short recovery block is available now.' };
  if (type === 'study_deadline') return { title: 'Study window', body: 'Use one block on the closest useful deadline.' };
  if (type === 'project_resume') return { title: 'Resume thread', body: 'Return to the next saved project move.' };
  if (type === 'run_continue') return { title: 'Continue run', body: 'One clean encounter keeps the run moving.' };
  if (type === 'weekly_insight') return { title: 'Weekly insight ready', body: 'Review the pattern before planning next week.' };
  return lane === 'minimal_normal'
    ? { title: 'Clean block', body: 'One useful session fits here.' }
    : { title: 'Next focus block', body: 'VEX has one useful next action ready.' };
}

export function decideNudge(rawInput: NudgePolicyInput): NudgeDecision {
  const input = NudgePolicyInputSchema.parse(rawInput);
  const maxDaily = maxDailyFor(input.lane);
  const budgetRemaining = Math.max(0, maxDaily - input.sentToday);
  const nudgeType = typeFor(input);

  if (input.userMuted) return blocked(input, budgetRemaining, 'User mute blocks all nudges.');
  if (input.completedSessions === 0 && !input.manuallyScheduled) {
    return blocked(input, budgetRemaining, 'Day 0 has no unsolicited notification.');
  }
  if (input.quietHoursActive && !input.manuallyScheduled) {
    return blocked(input, budgetRemaining, 'Quiet hours block this nudge.');
  }
  if (budgetRemaining <= 0) return blocked(input, budgetRemaining, 'Daily nudge budget reached.');
  if (input.recentDismissals >= 2 && nudgeType !== 'rescue') {
    return blocked(input, budgetRemaining, 'Recent dismissals suppress low-trust nudges.');
  }

  const copy = copyFor(input.lane, nudgeType);
  return NudgeDecisionSchema.parse({
    allowed: nudgeType !== 'none',
    type: nudgeType,
    title: copy.title,
    body: copy.body,
    scheduledFor: input.now,
    reason: 'Lane policy and budget allow this nudge.',
    lane: input.lane,
    priority: nudgeType === 'study_deadline' || nudgeType === 'rescue' ? 'high' : 'medium',
    budgetRemaining,
  });
}

function blocked(input: NudgePolicyInput, budgetRemaining: number, reason: string): NudgeDecision {
  return NudgeDecisionSchema.parse({
    allowed: false,
    type: 'none',
    title: null,
    body: null,
    scheduledFor: null,
    reason,
    lane: input.lane,
    priority: 'low',
    budgetRemaining,
  });
}
