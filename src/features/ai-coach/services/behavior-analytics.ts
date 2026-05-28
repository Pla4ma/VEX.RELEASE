import {
  type BehaviorSignal,
  type BehaviorProfile,
  type SignalType,
  BehaviorProfileSchema,
  BehaviorSignalSchema,
} from "../schemas";
import * as repository from "../repository";
import { withRetry } from "../utils/retry";
import type { BehaviorAnalytics } from "./behavior-analytics-types";
import { applyDecayAndWeight, aggregateSignals, calculateSignalConfidence, calculateConfidenceLevel, calculateExpiration, generateSignalUUID } from "./signal-processing";
import { DEFAULT_SIGNAL_CONFIG } from "./signal-config";
import { detectPatterns } from "./pattern-detection";
export { detectPatterns } from "./pattern-detection";
export type { DetectedPattern, BehaviorAnalytics } from "./behavior-analytics-types";

export async function processBehaviorSignal(
  userId: string,
  signalType: SignalType,
  value: number,
  metadata: Record<string, unknown> = {},
): Promise<BehaviorProfile> {
  const signal: BehaviorSignal = {
    id: generateSignalUUID(),
    userId,
    signalType,
    value,
    confidence: calculateSignalConfidence(signalType, value, metadata),
    timestamp: Date.now(),
    metadata,
    expiresAt: calculateExpiration(signalType),
  };
  const validatedSignal = BehaviorSignalSchema.parse(signal);
  await withRetry(
    () => repository.addBehaviorSignal(validatedSignal),
    { maxAttempts: 3 },
    "add-behavior-signal",
  );
  const profile = await rebuildBehaviorProfile(userId);
  return profile;
}

export async function rebuildBehaviorProfile(
  userId: string,
): Promise<BehaviorProfile> {
  const signals = await withRetry(
    () => repository.fetchRecentBehaviorSignals(userId, 100),
    { maxAttempts: 3 },
    "fetch-behavior-signals",
  );
  const weightedSignals = applyDecayAndWeight(signals);
  const aggregatedSignals = aggregateSignals(weightedSignals);
  const dataPoints = signals.length;
  const confidenceLevel = calculateConfidenceLevel(
    dataPoints,
    aggregatedSignals,
  );
  const profile: BehaviorProfile = {
    userId,
    signals: aggregatedSignals,
    lastUpdated: Date.now(),
    confidenceLevel,
    coldStart: dataPoints < DEFAULT_SIGNAL_CONFIG.coldStartThreshold,
    dataPoints,
  };
  const validatedProfile = BehaviorProfileSchema.parse(profile);
  await withRetry(
    () => repository.upsertBehaviorProfile(validatedProfile),
    { maxAttempts: 3 },
    "upsert-behavior-profile",
  );
  return validatedProfile;
}

export function generateBehaviorAnalytics(
  profile: BehaviorProfile,
): BehaviorAnalytics {
  const patterns = detectPatterns(profile);
  const morningSignal = profile.signals.find(
    (s) => s.signalType === "MORNING_PERSON",
  );
  const nightSignal = profile.signals.find((s) => s.signalType === "NIGHT_OWL");
  let dominantChronotype: "morning" | "evening" | "variable" | undefined;
  if (morningSignal && nightSignal) {
    if (morningSignal.value > nightSignal.value + 0.2) {
      dominantChronotype = "morning";
    } else if (nightSignal.value > morningSignal.value + 0.2) {
      dominantChronotype = "evening";
    } else {
      dominantChronotype = "variable";
    }
  }
  const consistencySignal = profile.signals.find(
    (s) => s.signalType === "CONSISTENCY_SCORE",
  );
  const consistencyScore = consistencySignal?.value || 0.5;
  const engagementSignals = profile.signals.filter((s) =>
    [
      "CHALLENGE_COMPLETION_RATE",
      "BOSS_PARTICIPATION",
      "SOCIAL_ENGAGEMENT",
    ].includes(s.signalType),
  );
  const engagementScore =
    engagementSignals.length > 0
      ? engagementSignals.reduce((sum, s) => sum + s.value, 0) /
        engagementSignals.length
      : 0.5;
  return {
    userId: profile.userId,
    timestamp: Date.now(),
    signalsCount: profile.signals.length,
    patternsDetected: patterns.length,
    confidenceLevel: profile.confidenceLevel,
    dominantChronotype,
    consistencyScore,
    engagementScore,
  };
}
