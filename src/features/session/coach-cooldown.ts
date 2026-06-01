import type { CoachInterventionRule } from './types';
import { SessionMode } from '../../session/modes';

interface InterventionRecord {
  ruleId: string;
  timestamp: number;
  sessionId: string;
}

interface SessionCooldownState {
  sessionId: string;
  startedAt: number;
  interventions: InterventionRecord[];
  lastInterventionAt: number | null;
}

const sessionCooldowns = new Map<string, SessionCooldownState>();

export const DEFAULT_ACTIVE_SESSION_RULES: CoachInterventionRule[] = [
  {
    id: 'pause-encouragement',
    trigger: 'PAUSE',
    cooldownSeconds: 300,
    maxPerSession: 1,
    messageTemplate: 'Pausing is okay. Take a breath and come back focused.',
    priority: 3,
  },
  {
    id: 'resume-acknowledgment',
    trigger: 'RESUME',
    cooldownSeconds: 60,
    maxPerSession: 2,
    messageTemplate: 'Welcome back. Your focus matters.',
    priority: 2,
  },
  {
    id: 'milestone-celebration',
    trigger: 'MILESTONE',
    cooldownSeconds: 600,
    maxPerSession: 3,
    messageTemplate:
      'You have completed {{percent}}% of your session. Keep going!',
    priority: 4,
  },
  {
    id: 'streak-risk-warning',
    trigger: 'STREAK_RISK',
    cooldownSeconds: 0,
    maxPerSession: 1,
    messageTemplate:
      'Your streak is at risk. Complete this session to maintain it.',
    priority: 10,
  },
  {
    id: 'low-purity-nudge',
    trigger: 'LOW_PURITY',
    cooldownSeconds: 180,
    maxPerSession: 2,
    messageTemplate:
      'Your focus has drifted. Take a moment to center yourself.',
    priority: 5,
  },
  {
    id: 'idle-reminder',
    trigger: 'IDLE',
    cooldownSeconds: 120,
    maxPerSession: 3,
    messageTemplate: 'Your session is waiting. Return to your focus.',
    priority: 6,
  },
];

export function initializeSessionCooldown(
  sessionId: string,
  _mode: (typeof SessionMode)[keyof typeof SessionMode],
): void {
  sessionCooldowns.set(sessionId, {
    sessionId,
    startedAt: Date.now(),
    interventions: [],
    lastInterventionAt: null,
  });
}

export function recordIntervention(sessionId: string, ruleId: string): void {
  const state = sessionCooldowns.get(sessionId);
  if (!state) {
    return;
  }

  const record: InterventionRecord = {
    ruleId,
    timestamp: Date.now(),
    sessionId,
  };

  state.interventions.push(record);
  state.lastInterventionAt = record.timestamp;
}

export function canTriggerIntervention(
  sessionId: string,
  rule: CoachInterventionRule,
): boolean {
  const state = sessionCooldowns.get(sessionId);
  if (!state) {
    return false;
  }

  const ruleInterventions = state.interventions.filter(
    (record) => record.ruleId === rule.id,
  );

  if (ruleInterventions.length >= rule.maxPerSession) {
    return false;
  }

  const lastIntervention = ruleInterventions[ruleInterventions.length - 1];
  if (lastIntervention) {
    const secondsSinceLastIntervention =
      (Date.now() - lastIntervention.timestamp) / 1000;
    if (secondsSinceLastIntervention < rule.cooldownSeconds) {
      return false;
    }
  }

  return true;
}

export function getGlobalCooldownRemaining(sessionId: string): number {
  const state = sessionCooldowns.get(sessionId);
  if (!state || !state.lastInterventionAt) {
    return 0;
  }

  const secondsSinceLastIntervention =
    (Date.now() - state.lastInterventionAt) / 1000;
  const globalCooldownSeconds = 60;
  const remaining = Math.max(
    0,
    globalCooldownSeconds - secondsSinceLastIntervention,
  );

  return Math.ceil(remaining);
}

export function getInterventionStats(sessionId: string): {
  totalInterventions: number;
  lastInterventionAt: number | null;
  secondsSinceLastIntervention: number | null;
} {
  const state = sessionCooldowns.get(sessionId);
  if (!state) {
    return {
      totalInterventions: 0,
      lastInterventionAt: null,
      secondsSinceLastIntervention: null,
    };
  }

  return {
    totalInterventions: state.interventions.length,
    lastInterventionAt: state.lastInterventionAt,
    secondsSinceLastIntervention: state.lastInterventionAt
      ? Math.floor((Date.now() - state.lastInterventionAt) / 1000)
      : null,
  };
}

export function cleanupSessionCooldown(sessionId: string): void {
  sessionCooldowns.delete(sessionId);
}
