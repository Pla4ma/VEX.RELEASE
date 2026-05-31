import { expect, jest } from '@jest/globals';
import type { ActionGate } from '../action-utils';

// ─── Mocks ─────────────────────────────────────────────────────────────────

jest.mock('../../focus-run/service', () => ({
  recordFocusRunEvent: jest.fn().mockImplementation(() => Promise.resolve({
    id: 'run-1',
    userId: 'u1',
    weekStartsAt: 0,
    status: 'active',
    bossId: null,
    modifiers: [],
    completedEncounters: 1,
    cleanStarts: 1,
    recoveryWins: 0,
    reflectionUpgrades: 0,
    finalGrade: null,
    events: [],
  })),
  buildFocusRunDisplay: jest.fn().mockReturnValue({
    laneAllowed: true,
    title: 'test',
    body: 'test',
    boss: {
      name: 'Test',
      archetype: 'cold_start_shadow' as const,
      evidenceCount: 0,
      isTeaser: true,
      isEvidenceBased: false,
      observedDays: 0,
      recoveryPrompt: 'test',
    },
    nextAction: 'test',
    modifiers: [],
    completedEncounters: 0,
    cleanStarts: 0,
    recoveryWins: 0,
    reflectionUpgrades: 0,
    finalGrade: null,
    weekSummary: 'test',
  }),
}));

jest.mock('../../study-os/service', () => ({
  createManualStudyPlan: jest.fn().mockImplementation(() => Promise.resolve({
    id: 'plan-1',
    userId: 'u1',
    title: 'Test Plan',
    blocks: [],
    reviewItems: [],
    source: {
      id: 's1',
      title: 'Test',
      type: 'manual',
      userId: 'u1',
      createdAt: 0,
      extractedTextStatus: 'none',
    },
    status: 'active',
    createdAt: 0,
    deadlineAt: null,
  })),
}));

jest.mock('../../project-focus/service', () => ({
  completeProjectSession: jest.fn().mockImplementation(() => Promise.resolve({
    id: 'thread-1',
    userId: 'u1',
    projectTitle: 'Test',
    currentObjective: 'Test objective',
    nextMove: 'Test move',
    lastSessionSummary: 'ok',
    blocker: null,
    handoffNote: null,
    openQuestions: [],
    state: 'active',
    staleRisk: 'none',
    bestSessionMode: 'CREATIVE',
    lastTouched: 0,
    rescuedAt: null,
  })),
}));

jest.mock('../../focus-memory/service', () => ({
  findMemoriesForRecommendation: jest.fn().mockImplementation(() => Promise.resolve([])),
}));

// ─── Test helper ────────────────────────────────────────────────────────────

/** Extract a named property from unknown result data for test assertions. */
export function expectData(data: unknown, key: string): unknown {
  expect(data).not.toBeNull();
  expect(data).toHaveProperty(key);
  return (data as Record<string, unknown>)[key];
}

// ─── Test data ─────────────────────────────────────────────────────────────

export const GATE_OPEN: ActionGate = { isAvailable: true, reason: 'available' };
export const GATE_CLOSED: ActionGate = {
  isAvailable: false,
  reason: 'feature is disabled',
};

export const validCreateFocusSession = {
  userId: 'u1',
  durationMinutes: 25,
  category: 'focus',
};

export const validStartSession = {
  userId: 'u1',
  lane: 'minimal_normal' as const,
  durationSeconds: 1500,
};

export const validStartRescue = {
  userId: 'u1',
  lane: 'student' as const,
  reason: 'unclear' as const,
};

export const validUpdateLaneOverride = {
  userId: 'u1',
  manualOverride: 'deep_creative' as const,
};

export const validCompleteReflection = {
  userId: 'u1',
  lane: 'student' as const,
  reflectionAnswer: 'I stayed focused',
  isComeback: false,
  summary: {
    sessionId: 's1',
    effectiveDuration: 1500,
    completionPercentage: 100,
    interruptions: 0,
    sessionMode: 'STUDY',
    status: 'COMPLETED',
  },
};
