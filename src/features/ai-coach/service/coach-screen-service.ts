import type { CoachActionIntent } from '../../coach-presence/types';
import { fetchCoachState } from '../repository/state';
import { fetchCoachHistory } from '../repository/messages';
import { type CoachMessage, type CoachState } from '../types';
import { askAiCoachFunction } from './coach-screen-ai';
import { captureSilentFailure } from '../../../utils/silent-failure';
import { isDevUser } from '../../../utils/supabase-resilience';
import type { CoachConversationTurn } from '../schemas';
import { CoachSessionUnavailableError } from '../repository/coach-ai-function-repository';
export interface CoachQuestionResponse {
  message: string;
  hasAction: boolean;
  actionLabel?: string;
  actionData?: {
    type: CoachActionIntent;
    duration?: number;
    difficulty?: string;
  };
}

export interface CoachRecommendation {
  duration: number;
  difficulty: 'EASY' | 'NORMAL' | 'CHALLENGING' | 'PUSH';
  reasoning: string;
}

export async function getCoachState(userId: string): Promise<CoachState> {
  try {
    const row = await fetchCoachState(userId);
    if (row) {
      return row;
    }
  } catch (error) {
    // Capture unexpected repository errors and rethrow for higher-level handling
    // The caller should log via Sentry; we preserve the original error message
    throw new Error(`Failed to fetch coach state: ${error instanceof Error ? error.message : String(error)}`);
  }
  // Fallback default state when no data exists
  return {
    userId,
    currentState: 'HIGH_CONFIDENCE',
    interventionsToday: 0,
    lastInterventionAt: null,
    muteUntil: null,
    personaId: 'FRIEND',
    previousState: null,
    reduceNotifications: false,
    stateEnteredAt: Date.now(),
    behaviorProfile: null,
  };
}

export async function getCoachHistory(
  userId: string,
  limit: number = 20,
): Promise<{ messages: CoachMessage[]; mutedCategories: string[] }> {
  return fetchCoachHistory(userId, limit);
}

export async function askCoachQuestion(
  question: string,
  userId?: string,
  recentConversation: CoachConversationTurn[] = [],
): Promise<CoachQuestionResponse> {
  if (!userId) {
    throw new Error('AI Coach requires a signed-in account.');
  }
  if (__DEV__ && !process.env.JEST_WORKER_ID && isDevUser()) {
    return buildLocalCoachResponse(question);
  }
  try {
    const aiResponse = await askAiCoachFunction(question, userId, recentConversation);
    if (aiResponse) {
      return aiResponse;
    }
    throw new Error('AI Coach did not return a live model response.');
  } catch (error) {
    if (error instanceof CoachSessionUnavailableError) {
      return buildLocalCoachResponse(question);
    }
    captureSilentFailure(error, {
      feature: 'ai-coach',
      operation: 'ask-question',
      type: 'network',
    });
    throw error instanceof Error
      ? error
      : new Error('AI Coach could not reach the live model.');
  }
}

export function buildLocalCoachResponse(question: string): CoachQuestionResponse {
  const normalized = question.toLowerCase();
  if (normalized.includes('study') || normalized.includes('material')) {
    return {
      actionData: { type: 'START_STUDY_SESSION' },
      actionLabel: 'Start study',
      hasAction: true,
      message: 'Local coach mode is ready. Turn one material thread into a short study block.',
    };
  }
  if (normalized.includes('progress') || normalized.includes('signal')) {
    return {
      actionData: { type: 'REVIEW_PROGRESS' },
      actionLabel: 'Review progress',
      hasAction: true,
      message: 'Local coach mode is ready. Review your signal, then choose one clear next block.',
    };
  }
  if (normalized.includes('break') || normalized.includes('tired')) {
    return {
      actionData: { type: 'TAKE_BREAK', duration: 5 },
      actionLabel: 'Take a break',
      hasAction: true,
      message: 'Local coach mode is ready. Take five quiet minutes, then return with one small target.',
    };
  }
  return {
    actionData: { type: 'START_SESSION', duration: 25 },
    actionLabel: 'Start focus',
    hasAction: true,
    message: 'Local coach mode is ready. Choose one narrow target and hold a clean 25-minute block.',
  };
}

export function getCurrentRecommendation(
  state?: CoachState,
): CoachRecommendation | null {
  if (!state) {
    return null;
  }

  switch (state.currentState) {
    case 'STREAK_AT_RISK':
      return {
        difficulty: 'EASY',
        duration: 15,
        reasoning:
          'Your streak needs a small block. Start the shortest safe session.',
      };
    case 'COLD_START':
      return {
        difficulty: 'NORMAL',
        duration: 20,
        reasoning: 'No session history yet. Start with 20 minutes so VEX can learn from a real block.',
      };
    case 'HIGH_CONFIDENCE':
      return {
        difficulty: 'CHALLENGING',
        duration: 45,
        reasoning: 'Your current state supports a deeper block. Protect 45 minutes only if the window is genuinely clear.',
      };
    case 'COMEBACK_MODE':
      return {
        difficulty: 'NORMAL',
        duration: 25,
        reasoning: 'The return starts small. Bank one steady block.',
      };
    default:
      return {
        difficulty: 'NORMAL',
        duration: 25,
        reasoning: 'One clean block is the next move.',
      };
  }
}
