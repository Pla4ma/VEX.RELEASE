import { captureSilentFailure } from '../../utils/silent-failure';
import { v4 } from '../../utils/uuid';
import type {
  BehaviorProfile,
  CreateRecommendationInput,
  SessionRecommendation,
} from './schemas';
import {
  generateCoachMessage,
  generateStreakRiskNudge,
} from '../../shared/ai/edge-function-service';
import { RISK_LEVEL_THRESHOLDS } from './session-analyzer-types';
import { getLatestSessionAIContext } from './session-context';

// ─── Recommendation sources type ────────────────────────────────
type RecommendationSource =
  | 'HISTORICAL_PATTERN'
  | 'STREAK_DATA'
  | 'LEVEL_PROGRESS'
  | 'CHALLENGE_DEADLINE'
  | 'BOSS_STATUS'
  | 'ENERGY_LEVEL'
  | 'TIME_OF_DAY';

type SuggestedDifficulty = 'EASY' | 'NORMAL' | 'CHALLENGING' | 'PUSH';

// ─── Public API ─────────────────────────────────────────────────
export async function buildRecommendation(
  input: CreateRecommendationInput,
  profile: BehaviorProfile | null,
): Promise<SessionRecommendation | null> {
  const sources: RecommendationSource[] = [];
  let suggestedDuration = 25 * 60;
  let suggestedDifficulty: SuggestedDifficulty = 'NORMAL';
  let reasoning = 'Based on your focus patterns';
  let confidence = 0.7;

  if (profile && !profile.coldStart) {
    const durationSignal = profile.signals.find(
      (s) => s.signalType === 'FOCUS_DURATION_PREFERENCE',
    );
    if (durationSignal) {
      suggestedDuration = Math.round(durationSignal.value * 60);
      sources.push('HISTORICAL_PATTERN');
    }
  }

  switch (input.type) {
    case 'STREAK_PROTECTION':
      suggestedDuration = Math.min(suggestedDuration, 15 * 60);
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
    case 'DIFFICULTY_ADJUST': {
      const difficultyValue = readNumber(input.context.currentDifficulty, 5);
      if (difficultyValue > 7) {
        suggestedDifficulty = 'EASY';
        reasoning = "Let's ease up and rebuild confidence";
      } else if (difficultyValue < 3) {
        suggestedDifficulty = 'CHALLENGING';
        reasoning = "Ready for more challenge? You've got this!";
      }
      sources.push('HISTORICAL_PATTERN');
      confidence = 0.75;
      break;
    }
    case 'BOSS_PREP':
      suggestedDifficulty = 'CHALLENGING';
      reasoning = 'Power up for the boss battle!';
      sources.push('BOSS_STATUS');
      confidence = 0.8;
      break;
  }

  const aiReasoning = await generateRecommendationReasoning(input, reasoning);

  return {
    id: v4(),
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
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    createdAt: Date.now(),
    status: 'ACTIVE',
  };
}

// ─── AI reasoning generation ────────────────────────────────────
async function generateRecommendationReasoning(
  input: CreateRecommendationInput,
  fallbackReasoning: string,
): Promise<string | null> {
  try {
    if (input.type === 'STREAK_PROTECTION') {
      const response = await generateStreakRiskNudge({
        userId: input.userId,
        context: {
          currentStreak: readNumber(
            input.context.currentStreak ?? input.context.streakDays,
            0,
          ),
          hoursRemaining: Math.max(
            1,
            24 - readNumber(input.context.hoursSinceLastSession, 0),
          ),
          riskLevel: resolveRiskLevel(
            readNumber(input.context.hoursSinceLastSession, 0),
          ),
          lastSessionQuality: readOptionalNumber(
            input.context.lastSessionQuality,
          ),
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
        hoursSinceLastSession: readOptionalNumber(
          input.context.hoursSinceLastSession,
        ),
        currentLevel: readOptionalNumber(input.context.currentLevel),
        recentSessionQuality: readOptionalNumber(
          input.context.lastSessionQuality,
        ),
        sessionDurationMinutes: latestSessionContext.sessionDurationMinutes,
        purityScore: latestSessionContext.purityScore,
        subjectHint: latestSessionContext.subjectHint,
      },
    });
    if (!response.success) {
      return fallbackReasoning;
    }
    return response.content?.trim() || fallbackReasoning;
  } catch (error) {
    captureSilentFailure(error, {
      feature: 'ai-coach',
      operation: 'ui-fallback',
      type: 'ui',
    });
    return null;
  }
}

// ─── Number helpers ─────────────────────────────────────────────
export function readNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

export function readOptionalNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value)
    ? value
    : undefined;
}

function resolveRiskLevel(
  hoursSinceLastSession: number,
): 'low' | 'medium' | 'high' | 'critical' {
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
