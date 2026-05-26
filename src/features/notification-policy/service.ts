import {
  NudgeDecisionSchema,
  NudgePolicyInputSchema,
  NudgeSignalRecordSchema,
  type NudgeDecision,
  type NudgePolicyInput,
  type NudgeSignalRecord,
  type NudgeType,
} from './schemas';
import type { Lane } from '../lane-engine/types';

const RESCUE_IGNORE_TIMEOUT_MS = 30 * 60 * 1000;

function maxDailyFor(lane: Lane): number {
  return lane === 'minimal_normal' ? 1 : 2;
}

function typeFor(input: NudgePolicyInput): NudgeType {
  const paused = input.pausedCategories.includes(laneToCategory(input.lane));
  if (paused) return 'none';

  if (input.context === 'avoidance') return 'rescue';
  if (input.context === 'deadline' && input.lane === 'student') return 'study_deadline';
  if (input.context === 'project_stale' && input.lane === 'deep_creative') return 'project_resume';
  if (input.context === 'run_open' && input.lane === 'game_like') return 'run_continue';
  if (input.context === 'weekly_ready') return 'weekly_insight';
  return input.completedSessions > 0 ? 'gentle_return' : 'none';
}

function laneToCategory(lane: Lane): 'study' | 'run' | 'project' | 'clean' {
  const map: Record<Lane, 'study' | 'run' | 'project' | 'clean'> = {
    student: 'study',
    game_like: 'run',
    deep_creative: 'project',
    minimal_normal: 'clean',
  };
  return map[lane];
}

// ── Lane-specific notification copy ────────────────────────────────────
function copyFor(lane: Lane, type: NudgeType): Pick<NudgeDecision, 'body' | 'title'> {
  if (type === 'none') return { title: null, body: null };
  if (type === 'rescue') {
    return { title: 'Cooldown ready', body: 'Recovery encounter ready: 10 clean minutes.' };
  }
  if (type === 'study_deadline') {
    return { title: 'Small window', body: 'Your next study block fits: 15 minutes on one topic.' };
  }
  if (type === 'project_resume') {
    return { title: 'Next move', body: 'Your project thread is waiting at the next move.' };
  }
  if (type === 'run_continue') {
    return { title: 'One encounter', body: 'One clean block is enough today.' };
  }
  if (type === 'weekly_insight') {
    return { title: 'Pattern ready', body: 'Review the numbers before planning next week.' };
  }
  if (lane === 'minimal_normal') {
    return { title: 'One block', body: 'One clean block is enough today.' };
  }
  return { title: 'Next block', body: 'VEX has one useful next action ready.' };
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
  if (input.recentDismissals >= 3) {
    return blocked(input, budgetRemaining, 'Repeated dismissals — category paused.');
  }
  if (input.recentDismissals >= 2 && nudgeType !== 'rescue') {
    return blocked(input, budgetRemaining, 'Recent dismissals suppress low-trust nudges.');
  }

  const aggressiveTypes: NudgeType[] = ['rescue', 'study_deadline', 'project_resume', 'run_continue'];
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

export function buildRescueDeepLink(
  rescuePlanId: string,
  taskDescription: string,
  suggestedDurationSeconds: number,
): { type: 'start_rescue'; payload: Record<string, unknown> } {
  return {
    type: 'start_rescue',
    payload: {
      rescuePlanId,
      rescueTaskDescription: taskDescription,
      suggestedDurationSeconds,
      source: 'rescue',
    },
  };
}

export function isRescueDeepLinkValid(deepLink: unknown): boolean {
  if (!deepLink || typeof deepLink !== 'object') return false;
  const link = deepLink as Record<string, unknown>;
  return (
    link.type === 'start_rescue' &&
    typeof link.payload === 'object' &&
    link.payload !== null &&
    typeof (link.payload as Record<string, unknown>).rescuePlanId === 'string'
  );
}

export function markExpiredAsIgnored(
  userId: string,
  lane: Lane,
  sentAtOrRecords: number | NudgeSignalRecord[],
): NudgeSignalRecord[] {
  const now = Date.now();
  const cutoff = typeof sentAtOrRecords === 'number'
    ? sentAtOrRecords
    : 0;

  const records: NudgeSignalRecord[] = typeof sentAtOrRecords === 'number'
    ? []
    : sentAtOrRecords.filter(
        (r) => r.signal === 'sent' && now - r.occurredAt > RESCUE_IGNORE_TIMEOUT_MS,
      );

  if (typeof sentAtOrRecords === 'number') {
    if (now - sentAtOrRecords > RESCUE_IGNORE_TIMEOUT_MS) {
      return [{
        userId,
        nudgeType: 'gentle_return',
        signal: 'ignored',
        lane,
        occurredAt: now,
      }];
    }
    return [];
  }

  return records.map((r) => ({
    ...r,
    signal: 'ignored' as const,
    occurredAt: now,
  }));
}
