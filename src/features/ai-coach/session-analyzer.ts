import { captureSilentFailure } from '../../utils/silent-failure';
/**
 * Session Analyzer
 * Business logic for analyzing session data and building behavior profiles
 *
 * Dependencies:
 * - Repository (data access)
 * - Persona Manager (coach state updates)
 * - Schemas (validation)
 */

import * as repository from './repository';
import { z } from 'zod';
import {
  ProcessBehaviorSignalInputSchema,
  CreateRecommendationInputSchema,
  type BehaviorProfile,
  type BehaviorSignal,
  type SignalType,
  type SessionRecommendation,
  type CoachUserState,
  type ProcessBehaviorSignalInput,
  type CreateRecommendationInput,
} from './schemas';
import { getOrCreateCoachState, updateCoachState } from './persona-manager';
import {
  generateCoachMessage,
  generateSessionSummary as generateAISessionSummary,
  generateStreakRiskNudge,
} from '../../shared/ai/edge-function-service';
import { getSessionRepository } from '../../session/repository/SessionRepository';
import { getSessionService } from '../../session/SessionService';
import type { SessionHistoryEntry } from '../../session/types';
// TODO: Content-study feature not implemented
// import { fetchGenerationRecord } from '../content-study/repository';
import type { GenerateSessionSummaryResponse } from '../../shared/ai';

// Stub for missing content-study function
type KeyConcept = { term: string; definition?: string };
type Summary = { overview: string; keyPoints?: string[] };

type GenerationRecord = {
  lastStudiedAt: number | null;
  keyConcepts: KeyConcept[];
  summary: Summary;
};

const fetchGenerationRecord = async (_docId: string): Promise<GenerationRecord> => {
  return { lastStudiedAt: null, keyConcepts: [], summary: { overview: '' } };
};

// ============================================================================
// Constants
// ============================================================================

const HIGH_CONFIDENCE_THRESHOLD_DATA_POINTS = 20;

const RISK_LEVEL_THRESHOLDS = {
  NONE: 0,
  LOW: 18,
  MEDIUM: 22,
  HIGH: 30,
  CRITICAL: 40,
};

const SessionNotesSchema = z.object({
  generationId: z.string().optional(),
  focusAreas: z.array(z.string()).optional(),
}).passthrough();

// ============================================================================
// Behavior Modeling
// ============================================================================

/**
 * Process a new behavior signal
 */
export async function processBehaviorSignal(
  input: ProcessBehaviorSignalInput
): Promise<BehaviorProfile> {
  const validated = ProcessBehaviorSignalInputSchema.parse(input);

  const signal: BehaviorSignal = {
    id: crypto.randomUUID(),
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

/**
 * Build or refresh behavior profile from signals
 */
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

function calculateSignalConfidence(signalType: SignalType, _value: number): number {
  // Different signals have different inherent confidence levels
  const baseConfidence: Record<SignalType, number> = {
    SESSION_FREQUENCY: 0.9,
    SESSION_QUALITY_TREND: 0.85,
    STREAK_MAINTENANCE_RATE: 0.95,
    PREFERRED_TIME_OF_DAY: 0.8,
    FOCUS_DURATION_PREFERENCE: 0.75,
    DIFFICULTY_PREFERENCE: 0.7,
    SOCIAL_ENGAGEMENT: 0.6,
    CHALLENGE_COMPLETION_RATE: 0.85,
    BOSS_PARTICIPATION: 0.9,
    MORNING_PERSON: 0.75,
    NIGHT_OWL: 0.75,
    WEEKEND_WARRIOR: 0.7,
    CONSISTENCY_SCORE: 0.9,
    RESPONSIVENESS_TO_REMINDERS: 0.65,
    COMEBACK_VELOCITY: 0.8,
  };

  return baseConfidence[signalType] || 0.7;
}

function calculateConfidenceLevel(dataPoints: number): 'LOW' | 'MEDIUM' | 'HIGH' {
  if (dataPoints < 10) {return 'LOW';}
  if (dataPoints < HIGH_CONFIDENCE_THRESHOLD_DATA_POINTS) {return 'MEDIUM';}
  return 'HIGH';
}

function aggregateSignals(signals: BehaviorSignal[]): BehaviorSignal[] {
  // Group by signal type and keep most recent per type
  const grouped = new Map<SignalType, BehaviorSignal>();

  for (const signal of signals) {
    const existing = grouped.get(signal.signalType);
    if (!existing || signal.timestamp > existing.timestamp) {
      grouped.set(signal.signalType, signal);
    }
  }

  return Array.from(grouped.values());
}

// ============================================================================
// State Determination
// ============================================================================

function determineUserState(
  _userId: string,
  profile: BehaviorProfile | null
): CoachUserState {
  if (!profile || profile.coldStart) {
    return 'COLD_START';
  }

  if (profile.confidenceLevel === 'LOW') {
    return 'LOW_CONFIDENCE';
  }

  return 'HIGH_CONFIDENCE';
}

async function updateStateFromProfile(userId: string, profile: BehaviorProfile): Promise<void> {
  const currentState = await getOrCreateCoachState(userId);
  const newState = determineUserState(userId, profile);

  if (currentState.currentState !== newState) {
    await updateCoachState(userId, newState, { profile });
  }
}

/**
 * Detect if streak is at risk and update state
 */
export async function detectStreakRisk(
  userId: string,
  hoursSinceLastSession: number,
  currentStreak: number
): Promise<boolean> {
  if (currentStreak === 0) {return false;}

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

function calculateRiskLevel(
  hoursSinceLastSession: number
): 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  if (hoursSinceLastSession > RISK_LEVEL_THRESHOLDS.CRITICAL) {return 'CRITICAL';}
  if (hoursSinceLastSession > RISK_LEVEL_THRESHOLDS.HIGH) {return 'HIGH';}
  if (hoursSinceLastSession > RISK_LEVEL_THRESHOLDS.MEDIUM) {return 'MEDIUM';}
  if (hoursSinceLastSession > RISK_LEVEL_THRESHOLDS.LOW) {return 'LOW';}
  return 'NONE';
}

// ============================================================================
// Session Recommendations
// ============================================================================

/**
 * Create a personalized session recommendation
 */
export async function createRecommendation(
  input: CreateRecommendationInput
): Promise<SessionRecommendation | null> {
  const validated = CreateRecommendationInputSchema.parse(input);
  const profile = await repository.fetchBehaviorProfile(validated.userId);

  const recommendation = await buildRecommendation(validated, profile);
  if (!recommendation) {return null;}

  // Expire any existing active recommendations of same type
  const existing = await repository.fetchRecommendations(validated.userId);
  const sameType = existing.filter(r => r.recommendationType === validated.type);

  for (const old of sameType) {
    await repository.updateRecommendationStatus(old.id, 'EXPIRED');
  }

  return repository.createRecommendation(recommendation);
}

async function buildRecommendation(
  input: CreateRecommendationInput,
  profile: BehaviorProfile | null
): Promise<SessionRecommendation | null> {
  const sources: Array<
    | 'HISTORICAL_PATTERN'
    | 'STREAK_DATA'
    | 'LEVEL_PROGRESS'
    | 'CHALLENGE_DEADLINE'
    | 'BOSS_STATUS'
    | 'ENERGY_LEVEL'
    | 'TIME_OF_DAY'
  > = [];

  let suggestedDuration = 25 * 60; // Default 25 minutes
  let suggestedDifficulty: 'EASY' | 'NORMAL' | 'CHALLENGING' | 'PUSH' = 'NORMAL';
  let reasoning = 'Based on your focus patterns';
  let confidence = 0.7;

  // Use behavior profile if available
  if (profile && !profile.coldStart) {
    const durationSignal = profile.signals.find(
      s => s.signalType === 'FOCUS_DURATION_PREFERENCE'
    );
    if (durationSignal) {
      suggestedDuration = Math.round(durationSignal.value * 60);
      sources.push('HISTORICAL_PATTERN');
    }
  }

  // Adjust based on recommendation type
  switch (input.type) {
    case 'STREAK_PROTECTION':
      suggestedDuration = Math.min(suggestedDuration, 15 * 60); // Max 15 min
      suggestedDifficulty = 'EASY';
      reasoning = 'Quick session to keep your streak alive!';
      sources.push('STREAK_DATA');
      confidence = 0.9;
      break;

    case 'COMEBACK_BUILDER':
      suggestedDifficulty = 'EASY';
      reasoning = 'Gentle restart to rebuild your momentum';
      sources.push('STREAK_DATA');
      confidence = 0.85;
      break;

    case 'DIFFICULTY_ADJUST':
      const difficultyProfile = input.context.currentDifficulty as number;
      if (difficultyProfile > 7) {
        suggestedDifficulty = 'EASY';
        reasoning = "Let's ease up and rebuild confidence";
      } else if (difficultyProfile < 3) {
        suggestedDifficulty = 'CHALLENGING';
        reasoning = "Ready for more challenge? You've got this!";
      }
      sources.push('HISTORICAL_PATTERN');
      confidence = 0.75;
      break;

    case 'BOSS_PREP':
      suggestedDifficulty = 'CHALLENGING';
      reasoning = 'Power up for the boss battle!';
      sources.push('BOSS_STATUS');
      confidence = 0.8;
      break;
  }

  const aiReasoning = await generateRecommendationReasoning(
    input,
    reasoning
  );

  return {
    id: crypto.randomUUID(),
    userId: input.userId,
    recommendationType: input.type,
    title: 'Personalized Recommendation',
    description: aiReasoning ?? reasoning,
    priority: Math.round(confidence * 10),
    reason: aiReasoning ?? reasoning,
    metadata: {},
    suggestedDuration,
    suggestedDifficulty,
    reasoning: aiReasoning ?? reasoning,
    confidence,
    basedOn: sources,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    createdAt: Date.now(),
    status: 'ACTIVE',
  };
}

async function generateRecommendationReasoning(
  input: CreateRecommendationInput,
  fallbackReasoning: string
): Promise<string | null> {
  try {
    if (input.type === 'STREAK_PROTECTION') {
      const response = await generateStreakRiskNudge({
        userId: input.userId,
        context: {
          currentStreak: readNumber(input.context.currentStreak ?? input.context.streakDays, 0),
          hoursRemaining: Math.max(1, 24 - readNumber(input.context.hoursSinceLastSession, 0)),
          riskLevel: resolveRiskLevel(readNumber(input.context.hoursSinceLastSession, 0)),
          lastSessionQuality: readOptionalNumber(input.context.lastSessionQuality),
        },
      });

      if (!response.success) {
        return fallbackReasoning;
      }

      return response.content?.trim() || null;
    }

    const latestSessionContext = await getLatestSessionAIContext(input.userId);
    const response = await generateCoachMessage({
      userId: input.userId,
      context: {
        category: 'SESSION_SUGGESTION',
        currentStreak: readOptionalNumber(input.context.streakDays),
        hoursSinceLastSession: readOptionalNumber(input.context.hoursSinceLastSession),
        currentLevel: readOptionalNumber(input.context.currentLevel),
        recentSessionQuality: readOptionalNumber(input.context.lastSessionQuality),
        sessionDurationMinutes: latestSessionContext.sessionDurationMinutes,
        purityScore: latestSessionContext.purityScore,
        subjectHint: latestSessionContext.subjectHint,
      },
    });

    if (!response.success) {
      return fallbackReasoning;
    }

    return response.content?.trim() || fallbackReasoning;
  } catch (error) { captureSilentFailure(error, { feature: 'ai-coach', operation: 'ui-fallback', type: 'ui' });
    return null;
  }
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
  }
): Promise<GenerateSessionSummaryResponse> {
  const enrichedContext = await enrichSessionSummaryContext(userId, context);
  return generateAISessionSummary({
    userId,
    context: enrichedContext,
  });
}

async function enrichSessionSummaryContext(
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
  }
): Promise<typeof context & {
  sessionDurationMinutes?: number;
  purityScore?: number;
  subjectHint?: string;
}> {
  const latestSessionContext = await getLatestSessionAIContext(userId);

  return {
    ...context,
    ...(typeof latestSessionContext.sessionDurationMinutes === 'number'
      ? { sessionDurationMinutes: latestSessionContext.sessionDurationMinutes }
      : {}),
    ...(typeof latestSessionContext.purityScore === 'number'
      ? { purityScore: latestSessionContext.purityScore }
      : {}),
    ...(latestSessionContext.subjectHint ? { subjectHint: latestSessionContext.subjectHint } : {}),
  };
}

async function getLatestSessionAIContext(userId: string): Promise<{
  sessionDurationMinutes?: number;
  purityScore?: number;
  subjectHint?: string;
}> {
  const latestSession = await getLatestSession(userId);
  if (!latestSession) {
    return {};
  }
  const sessionRepository = getSessionRepository(userId);
  const summary = latestSession.summary ?? await sessionRepository.getSessionSummary(latestSession.sessionId);
  const parsedNotes = parseSessionNotes(latestSession.config.notes);
  const generationId = latestSession.config.tags.includes('content-study')
    ? parsedNotes?.generationId ?? findGenerationIdInTags(latestSession.config.tags)
    : undefined;
  const subjectHint = await deriveSubjectHint(generationId, parsedNotes?.focusAreas);

  return {
    ...(typeof summary?.actualDuration === 'number'
      ? { sessionDurationMinutes: Math.max(1, Math.round(summary.actualDuration / 60)) }
      : {}),
    ...(typeof summary?.focusPurityScore === 'number'
      ? { purityScore: Math.round(summary.focusPurityScore) }
      : {}),
    ...(subjectHint ? { subjectHint } : {}),
  };
}

async function getLatestSession(userId: string): Promise<SessionHistoryEntry | null> {
  const sessionService = getSessionService();
  sessionService.setUserId(userId);
  if (hasRecentSessionsMethod(sessionService)) {
    const recentSessions = await sessionService.getRecentSessions(userId, 1);
    return recentSessions[0] ?? null;
  }
  const recentSessions = await sessionService.getSessionHistory(1);
  return recentSessions[0] ?? null;
}

function hasRecentSessionsMethod(
  service: ReturnType<typeof getSessionService>
): service is ReturnType<typeof getSessionService> & {
  getRecentSessions: (userId: string, limit: number) => Promise<SessionHistoryEntry[]>;
} {
  return 'getRecentSessions' in service && typeof service.getRecentSessions === 'function';
}

function parseSessionNotes(notes: string | undefined): z.infer<typeof SessionNotesSchema> | null {
  if (!notes) {
    return null;
  }
  try {
    return SessionNotesSchema.parse(JSON.parse(notes) as unknown);
  } catch (error) { captureSilentFailure(error, { feature: 'ai-coach', operation: 'ui-fallback', type: 'ui' });
    return null;
  }
}

function findGenerationIdInTags(tags: string[]): string | undefined {
  return tags.find((tag) => tag !== 'content-study' && tag.length > 8);
}

async function deriveSubjectHint(generationId?: string, focusAreas?: string[]): Promise<string | undefined> {
  if (focusAreas && focusAreas.length > 0) {
    return focusAreas[0];
  }
  if (!generationId) {
    return undefined;
  }
  const generation = await fetchGenerationRecord(generationId).catch(() => null);
  if (!generation) {
    return undefined;
  }
  return generation.keyConcepts[0]?.term ?? generation.summary.overview?.split('.').shift();
}

function readNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function readOptionalNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function resolveRiskLevel(hoursSinceLastSession: number): 'low' | 'medium' | 'high' | 'critical' {
  if (hoursSinceLastSession >= RISK_LEVEL_THRESHOLDS.CRITICAL) {
    return 'critical';
  }
  if (hoursSinceLastSession >= RISK_LEVEL_THRESHOLDS.HIGH) {
    return 'high';
  }
  if (hoursSinceLastSession >= RISK_LEVEL_THRESHOLDS.MEDIUM) {
    return 'medium';
  }
  return 'low';
}

// ============================================================================
// Challenge Suggestions
// ============================================================================

/**
 * Suggest challenges based on user profile
 */
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
    const consistencySignal = profile.signals.find(s => s.signalType === 'CONSISTENCY_SCORE');
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
