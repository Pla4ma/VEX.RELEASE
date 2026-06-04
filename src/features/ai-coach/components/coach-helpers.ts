import { lightColors } from '@/theme/tokens/colors';
import type { CoachState, CoachUserState } from '../types';
import {
  PERSONALITY_METADATA,
  type CoachStyle,
} from '../services/personality-templates';

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
      return "Welcome! You're just getting started — that's exciting. Let's build some momentum together. What brings you here today?";
    case 'HIGH_CONFIDENCE':
      return 'Your consistency is paying off. What can I help you with today?';
    case 'STREAK_AT_RISK':
      return "Your streak needs attention soon. Don't worry — I've got your back. Want to protect it together?";
    case 'COMEBACK_MODE':
      return 'Welcome back. Every master was once a beginner who returned. Your comeback starts now. How can I support you?';
    case 'POST_FAILURE_SUPPORT':
      return "Sessions didn't go as planned recently. That's okay — setbacks are part of growth. Let's talk about what happened and how to move forward.";
    default:
      return "Hi there. Ready to make today count? I'm here to help with sessions, streaks, or just a motivational boost.";
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
    return '';
  }
  switch (personaId) {
    case 'DRILL_SERGEANT':
      return '';
    case 'FRIEND':
      return '';
    case 'MENTOR':
      return '';
    case 'RIVAL':
      return '';
    case 'MINDFUL':
      return '';
    default:
      return '';
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
    return lightColors.semantic.success;
  }
  const stateColors: Record<CoachUserState, string> = {
    COLD_START: lightColors.accent.blue,
    LOW_CONFIDENCE: lightColors.semantic.warning,
    HIGH_CONFIDENCE: lightColors.semantic.success,
    STREAK_AT_RISK: lightColors.semantic.danger,
    COMEBACK_MODE: lightColors.accent.purple,
    POST_FAILURE_SUPPORT: lightColors.accent.orange,
    MILESTONE_HYPE: lightColors.accent.pink,
    OVERLOAD_PROTECTION: lightColors.accent.teal,
    MUTED_MODE: lightColors.text.muted,
  };
  return stateColors[state] || lightColors.semantic.success;
}
