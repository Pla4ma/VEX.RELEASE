import {
  WeeklyInsightInputSchema,
  WeeklyIntelligenceSchema,
  type WeeklyInsightInput,
  type WeeklyIntelligence,
} from "./schemas";
import {
  buildAdjustment,
  buildPremiumDeeperInsight,
  buildWhatGotInWay,
  buildWhatHelped,
  resolveBestNextSessionType,
} from "./insight-builders/insight-builders";

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
      weekLabel: "First Week",
      whatHelped: [],
      whatGotInWay: [],
      bestNextSessionType: undefined,
      suggestedFocusWindow: undefined,
      recommendedAdjustment:
        "Still early — VEX needs more sessions to form weekly insights. Keep going.",
      premiumDeeperInsight: undefined,
      hasEnoughData: false,
      disclaimer: "Not enough data for weekly intelligence yet.",
      generatedAt: now,
    });
  }

  return WeeklyIntelligenceSchema.parse({
    id: `weekly:${input.userId}:${now}`,
    userId: input.userId,
    lane: input.lane,
    weekLabel: "First Week",
    whatHelped: buildWhatHelped(input),
    whatGotInWay: buildWhatGotInWay(input),
    bestNextSessionType: resolveBestNextSessionType(input),
    suggestedFocusWindow: input.bestTimeWindow ?? undefined,
    recommendedAdjustment: buildAdjustment(input),
    premiumDeeperInsight: buildPremiumDeeperInsight(input),
    hasEnoughData: true,
    disclaimer:
      "Based on your first week of sessions. VEX may still be wrong — patterns take time to form.",
    generatedAt: now,
  });
}
