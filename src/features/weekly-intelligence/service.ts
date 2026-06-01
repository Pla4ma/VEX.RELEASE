import {
  WeeklyInsightInputSchema,
  WeeklyIntelligenceSchema,
  type WeeklyInsightInput,
  type WeeklyIntelligence,
} from './schemas';
import {
  buildAdjustment,
  buildPremiumDeeperInsight,
  buildWhatGotInWay,
  buildWhatHelped,
  resolveBestNextSessionType,
} from './insight-builders/insight-builders';

function buildNarrative(
  input: WeeklyInsightInput,
): { narrative: string; bestNextAction: string } {
  const { lane, completedSessions, rescueCompleted, avgDurationMinutes, cleanStarts, nudgeDismissals, staleThreadDays, bestTimeWindow } = input;

  if (lane === 'student') {
    const parts: string[] = [];
    if ((cleanStarts ?? 0) >= 2) {
      parts.push('Clean starts made your study blocks easier to finish.');
    }
    if (completedSessions >= 4) {
      parts.push('Naming the target before each block helped completion.');
    }
    if ((nudgeDismissals ?? 0) >= 2) {
      parts.push('VEX will stay quieter and surface only review targets.');
    }
    const narrative = parts.length > 0
      ? parts.join(' ')
      : 'VEX is still learning from your study patterns. One more block will sharpen this.';
    const bestNextAction = completedSessions >= 3
      ? 'Name one review target before your next study block.'
      : 'Complete one more study block to unlock weekly intelligence.';
    return { narrative, bestNextAction };
  }

  if (lane === 'game_like') {
    const parts: string[] = [];
    if ((rescueCompleted ?? 0) >= 1) {
      parts.push('Recovery runs helped you return this week.');
    }
    if (avgDurationMinutes < 20 && completedSessions >= 3) {
      parts.push('Shorter sessions kept momentum when longer ones would have stalled.');
    }
    const narrative = parts.length > 0
      ? parts.join(' ')
      : `Your best window was ${bestTimeWindow ?? 'when you started'}. VEX will protect that slot next week.`;
    const bestNextAction = 'Start with a 5-minute warm-up before the main run.';
    return { narrative, bestNextAction };
  }

  if (lane === 'deep_creative') {
    const parts: string[] = [];
    if ((staleThreadDays ?? 0) >= 2) {
      parts.push(`Your project went quiet for ${staleThreadDays} days. Saving a next move prevents this.`);
    }
    if (completedSessions >= 3) {
      parts.push('You returned faster when the next move was already saved.');
    }
    const narrative = parts.length > 0
      ? parts.join(' ')
      : 'VEX saved your thread position. Resuming is one tap away.';
    const bestNextAction = 'Save one concrete next move before closing the project.';
    return { narrative, bestNextAction };
  }

  // minimal_normal
  const parts: string[] = [];
  if ((nudgeDismissals ?? 0) >= 2) {
    parts.push('VEX will stay quieter. One action per day, no extra nudges.');
  }
  if (completedSessions >= 4) {
    parts.push('You completed more when VEX kept it to one action.');
  }
  const narrative = parts.length > 0
    ? parts.join(' ')
    : 'VEX is learning your quietest, most effective rhythm.';
  const bestNextAction = 'One clean block tomorrow. Same time, same setup.';
  return { narrative, bestNextAction };
}

function buildPremiumBridge(sessionCount: number): string | undefined {
  if (sessionCount < 5) {return undefined;}
  if (sessionCount < 7) {
    return 'Premium unlocks deeper history when VEX has enough signals.';
  }
  return 'VEX is starting to see your rhythm. Premium keeps deeper history and sharper weekly intelligence.';
}

export function buildWeeklyIntelligence(
  rawInput: WeeklyInsightInput,
): WeeklyIntelligence {
  const input = WeeklyInsightInputSchema.parse(rawInput);
  const hasEnoughData = input.totalSessions >= 3 && input.totalFocusMinutes >= 30;
  const now = Date.now();

  if (!hasEnoughData) {
    return WeeklyIntelligenceSchema.parse({
      id: `weekly:${input.userId}:${now}`,
      userId: input.userId,
      lane: input.lane,
      weekLabel: 'First Week',
      whatHelped: [],
      whatGotInWay: [],
      bestNextSessionType: undefined,
      suggestedFocusWindow: undefined,
      recommendedAdjustment:
        'Still early — VEX needs more sessions to form weekly insights. Keep going.',
      premiumDeeperInsight: undefined,
      hasEnoughData: false,
      disclaimer: 'Not enough data for weekly intelligence yet.',
      generatedAt: now,
    });
  }

  const { narrative, bestNextAction } = buildNarrative(input);
  const recommendation = buildAdjustment(input);
  const premium = buildPremiumBridge(input.totalSessions);

  return WeeklyIntelligenceSchema.parse({
    id: `weekly:${input.userId}:${now}`,
    userId: input.userId,
    lane: input.lane,
    weekLabel: 'First Week',
    whatHelped: buildWhatHelped(input),
    whatGotInWay: buildWhatGotInWay(input),
    bestNextSessionType: resolveBestNextSessionType(input),
    suggestedFocusWindow: input.bestTimeWindow ?? undefined,
    recommendedAdjustment:
      `${narrative} ${bestNextAction} ${recommendation}`.slice(0, 300),
    premiumDeeperInsight: premium ?? buildPremiumDeeperInsight(input),
    hasEnoughData: true,
    disclaimer:
      'Based on your first week of sessions. VEX may still be wrong — patterns take time to form.',
    generatedAt: now,
  });
}
