/**
 * Shared helpers for cold-start verification tests
 */
import type { HomeContext } from '../service';
import type { CompletionContext, WeeklyIntelligenceContext } from '../service-surface';

export function coldStudyHome(): HomeContext {
  return { laneOverride: 'student', completedSessions: 0 };
}

export function coldProjectHome(): HomeContext {
  return { laneOverride: 'deep_creative', completedSessions: 0 };
}

export function coldRunHome(): HomeContext {
  return { laneOverride: 'game_like', completedSessions: 1 };
}

export function coldCleanHome(): HomeContext {
  return { laneOverride: 'minimal_normal', completedSessions: 0 };
}

export function coldStudyCompletion(): CompletionContext {
  return { laneOverride: 'student', completedSessions: 1 };
}

export function evidenceStudyCompletion(): CompletionContext {
  return { laneOverride: 'student', completedSessions: 5 };
}

export function coldRunCompletion(): CompletionContext {
  return { laneOverride: 'game_like', completedSessions: 2 };
}

export function coldProjectCompletion(): CompletionContext {
  return { laneOverride: 'deep_creative', completedSessions: 0 };
}

export function coldWeeklyIntelligence(): WeeklyIntelligenceContext {
  return { laneOverride: 'student', completedSessions: 2, totalSessions: 3 };
}
