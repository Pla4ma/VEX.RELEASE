import type { CoachActionIntent } from '../../coach-presence/types';
import { fetchCoachState } from '../repository/state';
import { type CoachMessage, type CoachState } from '../types';
import { askAiCoachFunction } from './coach-screen-ai';
import { getFallbackCoachResponse } from './coach-screen-fallback';

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

export async function getCoachHistory(): Promise<{ messages: CoachMessage[] }> {
  return { messages: [] };
}

export async function askCoachQuestion(
  question: string,
  userId?: string,
): Promise<CoachQuestionResponse> {
  try {
    const aiResponse = await askAiCoachFunction(question, userId);
    if (aiResponse) {
      return aiResponse;
    }

    return getFallbackCoachResponse(question);
  } catch (error) {
    // AI function failed - return fallback instead of throwing
    // The fallback provides a meaningful response without exposing internal errors
    console.warn('[askCoachQuestion] AI failed, using fallback:', error);
    return getFallbackCoachResponse(question);
  }
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
        reasoning: 'First rhythm matters. Start with one clear block.',
      };
    case 'HIGH_CONFIDENCE':
      return {
        difficulty: 'CHALLENGING',
        duration: 45,
        reasoning: 'Your rhythm is warm. Use one deeper block.',
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
