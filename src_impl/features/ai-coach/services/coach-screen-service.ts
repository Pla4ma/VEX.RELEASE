/**
 * Coach Screen Service
 *
 * Service layer for the Coach Screen UI
 * Handles fetching coach state, history, and processing questions
 */

import { type CoachState, type CoachUserState, type CoachMessage } from '../types';

// ============================================================================
// Types
// ============================================================================

export interface CoachQuestionResponse {
  message: string;
  hasAction: boolean;
  actionLabel?: string;
  actionData?: {
    type: 'START_SESSION' | 'VIEW_STREAK' | 'VIEW_PROGRESS' | 'NONE';
    duration?: number;
    difficulty?: string;
  };
}

export interface CoachRecommendation {
  duration: number;
  difficulty: 'EASY' | 'NORMAL' | 'CHALLENGING' | 'PUSH';
  reasoning: string;
}

// ============================================================================
// Service Functions
// ============================================================================

/**
 * Get current coach state for the user
 */
export async function getCoachState(): Promise<CoachState> {
  // In production, this would fetch from Supabase or local state
  // For now, return mock state
  return {
    userId: 'current-user',
    currentState: 'HIGH_CONFIDENCE' as CoachUserState,
    previousState: null,
    stateEnteredAt: Date.now(),
    personaId: 'FRIEND',
    behaviorProfile: null,
    lastInterventionAt: null,
    interventionsToday: 0,
    muteUntil: null,
    reduceNotifications: false,
  };
}

/**
 * Get coach message history
 */
export async function getCoachHistory(): Promise<{ messages: CoachMessage[] }> {
  // In production, fetch from repository
  return {
    messages: [],
  };
}

/**
 * Ask the coach a question
 * This would integrate with the edge function
 */
export async function askCoachQuestion(question: string): Promise<CoachQuestionResponse> {
  // In production, this calls the Supabase edge function
  // For now, provide contextual responses based on question content

  const lowerQuestion = question.toLowerCase();

  // Session-related questions
  if (lowerQuestion.includes('session') || lowerQuestion.includes('focus') || lowerQuestion.includes('start')) {
    return {
      message: "Based on your patterns, a 25-minute session would be perfect right now. You've had great success with this duration before!",
      hasAction: true,
      actionLabel: 'Start 25-min Session',
      actionData: {
        type: 'START_SESSION',
        duration: 25,
        difficulty: 'NORMAL',
      },
    };
  }

  // Streak-related questions
  if (lowerQuestion.includes('streak') || lowerQuestion.includes('daily')) {
    return {
      message: "Your streak is looking strong! You've maintained great consistency. Remember, it's about progress, not perfection.",
      hasAction: true,
      actionLabel: 'View Streak',
      actionData: {
        type: 'VIEW_STREAK',
      },
    };
  }

  // Progress-related questions
  if (lowerQuestion.includes('progress') || lowerQuestion.includes('level') || lowerQuestion.includes('xp')) {
    return {
      message: "You're making solid progress! Each session is building toward your goals. Keep the momentum going!",
      hasAction: true,
      actionLabel: 'View Progress',
      actionData: {
        type: 'VIEW_PROGRESS',
      },
    };
  }

  // Motivation/default
  return {
    message: "I'm here to support your focus journey! Whether it's starting a session, checking your streak, or just getting a motivational boost — just let me know what you need.",
    hasAction: false,
  };
}

/**
 * Get current recommendation based on coach state
 */
export function getCurrentRecommendation(state?: CoachState): CoachRecommendation | null {
  if (!state) {return null;}

  switch (state.currentState) {
    case 'STREAK_AT_RISK':
      return {
        duration: 15,
        difficulty: 'EASY',
        reasoning: 'Your streak needs attention soon. A quick 15-minute session will protect it without overwhelming you.',
      };

    case 'COLD_START':
      return {
        duration: 20,
        difficulty: 'NORMAL',
        reasoning: "Let's ease you in with a 20-minute session. Perfect for building momentum without pressure.",
      };

    case 'HIGH_CONFIDENCE':
      return {
        duration: 45,
        difficulty: 'CHALLENGING',
        reasoning: "You're in the zone! A 45-minute challenging session will maximize your productive flow.",
      };

    case 'COMEBACK_MODE':
      return {
        duration: 25,
        difficulty: 'NORMAL',
        reasoning: 'Welcome back! A 25-minute session is the perfect way to restart your momentum.',
      };

    default:
      return {
        duration: 25,
        difficulty: 'NORMAL',
        reasoning: 'Based on your patterns, a 25-minute session would be ideal right now.',
      };
  }
}
