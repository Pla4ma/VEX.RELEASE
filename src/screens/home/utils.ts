/**
 * Home Screen Utilities
 *
 * Helper functions for HomeScreen data transformations.
 */

import type { CompanionMood } from '../../features/companion/types';
import type { SessionHistoryEntry } from '../../session/types';
import type { ActiveIntervention } from '../../features/ai-coach/hooks/useActiveIntervention';
import { resolveSessionMode } from '../../session/modes';
import type { SessionStackParams } from '../../navigation/types';

export type QualityGrade = 'S' | 'A' | 'B' | 'C' | 'D';

export function getQualityGrade(score: number): QualityGrade {
  if (score >= 95) {
    return 'S';
  }
  if (score >= 85) {
    return 'A';
  }
  if (score >= 70) {
    return 'B';
  }
  if (score >= 50) {
    return 'C';
  }
  return 'D';
}

export function getHomeCompanionMood(
  history: SessionHistoryEntry[],
  streakDays: number,
): CompanionMood {
  const latest = history[0];
  const latestEndedAt = latest?.endedAt;
  if (!latestEndedAt || Date.now() - latestEndedAt > 48 * 60 * 60 * 1000) {
    return 'SLEEPY';
  }
  if (streakDays > 0) {
    return 'FOCUSED';
  }
  const score =
    latest.summary?.focusPurityScore ?? latest.summary?.focusQuality ?? 0;
  if (score >= 95) {
    return 'ECSTATIC';
  }
  if (score >= 70) {
    return 'CONTENT';
  }
  return 'SLEEPY';
}

export function readSuggestedDuration(
  intervention: ActiveIntervention,
): number {
  const value = intervention.metadata.suggestedDuration;
  return typeof value === 'number' ? value : 15 * 60;
}

export function readSuggestedMode(
  intervention: ActiveIntervention,
): NonNullable<SessionStackParams['SessionSetup']>['presetMode'] {
  const mode = resolveSessionMode(intervention.metadata.suggestedMode);
  if (
    mode === 'DEEP_WORK' ||
    mode === 'LIGHT_FOCUS' ||
    mode === 'STUDY' ||
    mode === 'CREATIVE' ||
    mode === 'SPRINT'
  ) {
    return mode;
  }
  return 'LIGHT_FOCUS';
}
