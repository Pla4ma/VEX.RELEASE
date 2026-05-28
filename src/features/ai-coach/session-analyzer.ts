import { v4 } from "../../utils/uuid";
import * as repository from "./repository";
import {
  ProcessBehaviorSignalInputSchema,
  CreateRecommendationInputSchema,
  type BehaviorProfile,
  type BehaviorSignal,
  type ProcessBehaviorSignalInput,
  type CreateRecommendationInput,
  type SessionRecommendation,
} from "./schemas";
import { getOrCreateCoachState, updateCoachState } from "./persona-manager";
import { generateAISessionSummary } from "../../shared/ai/edge-function-service";
import type { GenerateSessionSummaryResponse } from "../../shared/ai";
import {
  calculateSignalConfidence,
  calculateConfidenceLevel,
  aggregateSignals,
  determineUserState,
} from "./behavior-signal-helpers";
import {
  buildRecommendation,
  readNumber,
} from "./recommendation-builder";
import {
  enrichSessionSummaryContext,
  type SessionSummaryContext,
} from "./session-context";

import { RISK_LEVEL_THRESHOLDS } from "./session-analyzer-types";

function calculateRiskLevel(
  hoursSinceLastSession: number,
): "NONE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
  if (hoursSinceLastSession > RISK_LEVEL_THRESHOLDS.CRITICAL) {
    return "CRITICAL";
  }
  if (hoursSinceLastSession > RISK_LEVEL_THRESHOLDS.HIGH) {
    return "HIGH";
  }
  if (hoursSinceLastSession > RISK_LEVEL_THRESHOLDS.MEDIUM) {
    return "MEDIUM";
  }
  if (hoursSinceLastSession > RISK_LEVEL_THRESHOLDS.LOW) {
    return "LOW";
  }
  return "NONE";
}

// ─── State update helper ────────────────────────────────────────
async function updateStateFromProfile(
  userId: string,
  profile: BehaviorProfile,
): Promise<void> {
  const currentState = await getOrCreateCoachState(userId);
  const newState = determineUserState(userId, profile);
  if (currentState.currentState !== newState) {
    await updateCoachState(userId, newState, { profile });
  }
}

// ─── Exported: process behavior signal ──────────────────────────
export async function processBehaviorSignal(
  input: ProcessBehaviorSignalInput,
): Promise<BehaviorProfile> {
  const validated = ProcessBehaviorSignalInputSchema.parse(input);
  const signal: BehaviorSignal = {
    id: v4(),
    userId: validated.userId,
    signalType: validated.signalType,
    value: validated.value,
    confidence: calculateSignalConfidence(
      validated.signalType,
      validated.value,
    ),
    timestamp: Date.now(),
    metadata: validated.metadata || {},
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
  };
  await repository.addBehaviorSignal(signal);
  const profile = await buildBehaviorProfile(validated.userId);
  await updateStateFromProfile(validated.userId, profile);
  return profile;
}

// ─── Exported: build behavior profile ───────────────────────────
export async function buildBehaviorProfile(
  userId: string,
): Promise<BehaviorProfile> {
  const signals = await repository.fetchRecentBehaviorSignals(userId, 50);
  const dataPoints = signals.length;
  const coldStart = dataPoints < 5;
  const confidenceLevel = calculateConfidenceLevel(dataPoints);
  const aggregatedSignals = aggregateSignals(signals);
  const profile: BehaviorProfile = {
    userId,
    signals: aggregatedSignals,
    lastUpdated: Date.now(),
    confidenceLevel,
    coldStart,
    dataPoints,
  };
  await repository.upsertBehaviorProfile(profile);
  return profile;
}

// ─── Exported: detect streak risk ───────────────────────────────
export async function detectStreakRisk(
  userId: string,
  hoursSinceLastSession: number,
  currentStreak: number,
): Promise<boolean> {
  if (currentStreak === 0) {
    return false;
  }
  const riskLevel = calculateRiskLevel(hoursSinceLastSession);
  const isAtRisk = riskLevel !== "NONE";
  if (isAtRisk) {
    const state = await getOrCreateCoachState(userId);
    if (
      state.currentState !== "STREAK_AT_RISK" &&
      state.currentState !== "COMEBACK_MODE"
    ) {
      await updateCoachState(userId, "STREAK_AT_RISK", {
        riskLevel,
        hoursSinceLastSession,
        currentStreak,
      });
    }
  }
  return isAtRisk;
}

// ─── Exported: create recommendation ────────────────────────────
export async function createRecommendation(
  input: CreateRecommendationInput,
): Promise<SessionRecommendation | null> {
  const validated = CreateRecommendationInputSchema.parse(input);
  const profile = await repository.fetchBehaviorProfile(validated.userId);
  const recommendation = await buildRecommendation(validated, profile);
  if (!recommendation) {
    return null;
  }
  const existing = await repository.fetchRecommendations(validated.userId);
  const sameType = existing.filter(
    (r) => r.recommendationType === validated.type,
  );
  for (const old of sameType) {
    await repository.updateRecommendationStatus(old.id, "EXPIRED");
  }
  return repository.createRecommendation(recommendation);
}

// ─── Exported: generate session summary ─────────────────────────
export async function generateSessionSummary(
  userId: string,
  context: SessionSummaryContext,
): Promise<GenerateSessionSummaryResponse> {
  const enrichedContext = await enrichSessionSummaryContext(userId, context);
  return generateAISessionSummary({ userId, context: enrichedContext });
}

// ─── Exported: suggest challenges ───────────────────────────────
export async function suggestChallenges(
  userId: string,
): Promise<{
  suggestedChallenges: Array<{
    challengeId: string;
    reason: string;
    matchScore: number;
  }>;
}> {
  const profile = await repository.fetchBehaviorProfile(userId);
  const suggestions: Array<{
    challengeId: string;
    reason: string;
    matchScore: number;
  }> = [];
  if (profile) {
    const consistencySignal = profile.signals.find(
      (s) => s.signalType === "CONSISTENCY_SCORE",
    );
    if (consistencySignal && consistencySignal.value > 0.7) {
      suggestions.push({
        challengeId: "streak-master",
        reason: "Your consistency shows you can maintain streaks!",
        matchScore: 0.9,
      });
    }
  }
  return { suggestedChallenges: suggestions };
}
