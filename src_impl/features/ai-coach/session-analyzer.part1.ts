import { captureSilentFailure } from "../../utils/silent-failure";
import { v4 } from "../../utils/uuid";
import * as repository from "./repository";
import { z } from "zod";
import { ProcessBehaviorSignalInputSchema, CreateRecommendationInputSchema, type BehaviorProfile, type BehaviorSignal, type SignalType, type SessionRecommendation, type CoachUserState, type ProcessBehaviorSignalInput, type CreateRecommendationInput } from "./schemas";
import { getOrCreateCoachState, updateCoachState } from "./persona-manager";
import { generateCoachMessage, generateSessionSummary as generateAISessionSummary, generateStreakRiskNudge } from "../../shared/ai/edge-function-service";
import { getSessionRepository } from "../../session/repository/SessionRepository";
import { getSessionService } from "../../session/SessionService";
import type { SessionHistoryEntry } from "../../session/types";
import type { GenerateSessionSummaryResponse } from "../../shared/ai";


export async function processBehaviorSignal(input: ProcessBehaviorSignalInput): Promise<BehaviorProfile> {
  const validated = ProcessBehaviorSignalInputSchema.parse(input);

  const signal: BehaviorSignal = {
    id: v4(),
    userId: validated.userId,
    signalType: validated.signalType,
    value: validated.value,
    confidence: calculateSignalConfidence(validated.signalType, validated.value),
    timestamp: Date.now(),
    metadata: validated.metadata || {},
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
  };

  await repository.addBehaviorSignal(signal);

  // Rebuild profile with new signal
  const profile = await buildBehaviorProfile(validated.userId);

  // Update state if confidence level changed
  await updateStateFromProfile(validated.userId, profile);

  return profile;
}

export async function buildBehaviorProfile(userId: string): Promise<BehaviorProfile> {
  const signals = await repository.fetchRecentBehaviorSignals(userId, 50);
  const existingProfile = await repository.fetchBehaviorProfile(userId);

  const dataPoints = signals.length;
  const coldStart = dataPoints < 5;
  const confidenceLevel = calculateConfidenceLevel(dataPoints);

  // Aggregate signals into profile
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

export async function detectStreakRisk(userId: string, hoursSinceLastSession: number, currentStreak: number): Promise<boolean> {
  if (currentStreak === 0) {
    return false;
  }

  const riskLevel = calculateRiskLevel(hoursSinceLastSession);
  const isAtRisk = riskLevel !== 'NONE';

  if (isAtRisk) {
    const state = await getOrCreateCoachState(userId);
    if (state.currentState !== 'STREAK_AT_RISK' && state.currentState !== 'COMEBACK_MODE') {
      await updateCoachState(userId, 'STREAK_AT_RISK', {
        riskLevel,
        hoursSinceLastSession,
        currentStreak,
      });
    }
  }

  return isAtRisk;
}

export async function createRecommendation(input: CreateRecommendationInput): Promise<SessionRecommendation | null> {
  const validated = CreateRecommendationInputSchema.parse(input);
  const profile = await repository.fetchBehaviorProfile(validated.userId);

  const recommendation = await buildRecommendation(validated, profile);
  if (!recommendation) {
    return null;
  }

  // Expire any existing active recommendations of same type
  const existing = await repository.fetchRecommendations(validated.userId);
  const sameType = existing.filter((r) => r.recommendationType === validated.type);

  for (const old of sameType) {
    await repository.updateRecommendationStatus(old.id, 'EXPIRED');
  }

  return repository.createRecommendation(recommendation);
}

export async function generateSessionSummary(
  userId: string,
  context: {
    sessionCount: number;
    totalFocusMinutes: number;
    averageQuality: number;
    streakDays: number;
    xpEarned: number;
    challengesCompleted: number;
    bossDamageDealt?: number;
    preferredTimeOfDay?: string;
    consistencyScore?: number;
  },
): Promise<GenerateSessionSummaryResponse> {
  const enrichedContext = await enrichSessionSummaryContext(userId, context);
  return generateAISessionSummary({
    userId,
    context: enrichedContext,
  });
}

export async function suggestChallenges(userId: string): Promise<{
  suggestedChallenges: Array<{
    challengeId: string;
    reason: string;
    matchScore: number;
  }>;
}> {
  const profile = await repository.fetchBehaviorProfile(userId);

  // Simplified - would integrate with challenges feature
  const suggestions: Array<{ challengeId: string; reason: string; matchScore: number }> = [];

  if (profile) {
    const consistencySignal = profile.signals.find((s) => s.signalType === 'CONSISTENCY_SCORE');
    if (consistencySignal && consistencySignal.value > 0.7) {
      suggestions.push({
        challengeId: 'streak-master',
        reason: 'Your consistency shows you can maintain streaks!',
        matchScore: 0.9,
      });
    }
  }

  return { suggestedChallenges: suggestions };
}