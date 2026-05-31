import type { CoachState, CoachUserState } from '../types';
import {
  PERSONALITY_METADATA,
  type CoachStyle,
} from '../services/personality-templates';
import { launchColors } from '@theme/tokens/launch-colors';

function isCoachStyle(value: string): value is CoachStyle {
  return value in PERSONALITY_METADATA;
}

export function getWelcomeMessage(
  coachState?: CoachState | null,
): string {
  if (!coachState) {
    return "Hi! I'm your AI coach. I'm here to help you build focus habits and achieve your goals. What would you like to work on today?";
  }
  switch (coachState.currentState) {
    case 'COLD_START':
      return "Welcome! You're just getting started — that's exciting! Let's build some momentum together. What brings you here today?";
    case 'HIGH_CONFIDENCE':
      return 'Your consistency is paying off. What can I help you with today?';
    case 'STREAK_AT_RISK':
      return "Your streak needs attention soon. Don't worry — I've got your back. Want to protect it together?";
    case 'COMEBACK_MODE':
      return 'Welcome back! 💪 Every master was once a beginner who returned. Your comeback starts now. How can I support you?';
    case 'POST_FAILURE_SUPPORT':
      return "Sessions didn't go as planned recently. That's okay — setbacks are part of growth. Let's talk about what happened and how to move forward.";
    default:
      return "Hi there! Ready to make today count? I'm here to help with sessions, streaks, or just a motivational boost.";
  }
}

export function getPersonalityName(
  personaId?: string | null,
): string {
  if (!personaId || !isCoachStyle(personaId)) {
    return 'Coach';
  }
  return PERSONALITY_METADATA[personaId].name || 'Coach';
}

export function getPersonalityEmoji(
  personaId?: string | null,
): string {
  if (!personaId) {
    return '🎯';
  }
  switch (personaId) {
    case 'DRILL_SERGEANT':
      return '⭐';
    case 'FRIEND':
      return '🤗';
    case 'MENTOR':
      return '📚';
    case 'RIVAL':
      return '⚡';
    case 'MINDFUL':
      return '🧘';
    default:
      return '🎯';
  }
}

export function formatState(
  state?: CoachUserState | null,
): string {
  if (!state) {
    return 'Ready';
  }
  const stateLabels: Record<CoachUserState, string> = {
    COLD_START: 'Getting Started',
    LOW_CONFIDENCE: 'Building Confidence',
    HIGH_CONFIDENCE: 'In The Zone',
    STREAK_AT_RISK: 'Streak Alert',
    COMEBACK_MODE: 'Comeback',
    POST_FAILURE_SUPPORT: 'Recovery',
    MILESTONE_HYPE: 'Celebrating',
    OVERLOAD_PROTECTION: 'Rest Mode',
    MUTED_MODE: 'Quiet',
  };
  return stateLabels[state] || 'Active';
}

export function getStateColor(
  state?: CoachUserState | null,
): string {
  if (!state) {
    return launchColors.hex_22c55e;
  }
  const stateColors: Record<CoachUserState, string> = {
    COLD_START: launchColors.hex_3b82f6,
    LOW_CONFIDENCE: launchColors.hex_f59e0b,
    HIGH_CONFIDENCE: launchColors.hex_22c55e,
    STREAK_AT_RISK: launchColors.hex_ef4444,
    COMEBACK_MODE: launchColors.hex_8b5cf6,
    POST_FAILURE_SUPPORT: launchColors.hex_f97316,
    MILESTONE_HYPE: launchColors.hex_ec4899,
    OVERLOAD_PROTECTION: launchColors.hex_06b6d4,
    MUTED_MODE: launchColors.hex_6b7280,
  };
  return stateColors[state] || launchColors.hex_22c55e;
}
