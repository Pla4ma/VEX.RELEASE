import { CompletionEngine } from "./CompletionEngine";
import { ScoringEngine } from "./ScoringEngine";
import type { SessionState, FocusQualityMetrics } from "../types";

export function createMockSession(
  overrides: Partial<SessionState> = {},
): SessionState {
  return {
    id: "test-session",
    userId: "test-user",
    status: "ACTIVE",
    phase: "FOCUS",
    config: {
      duration: 1500,
      breakDuration: 300,
      longBreakDuration: 900,
      intervals: 4,
      longBreakInterval: 4,
      soundEnabled: false,
      vibrationEnabled: false,
      dndEnabled: false,
      strictMode: false,
      autoStartBreaks: false,
      autoStartPomodoros: false,
    },
    currentInterval: 1,
    totalIntervals: 4,
    elapsedTime: 1500,
    remainingTime: 0,
    effectiveTime: 1500,
    completionPercentage: 100,
    interruptions: 0,
    pauses: 0,
    startTime: Date.now() - 1500000,
    ...overrides,
  } as SessionState;
}

export function createMockMetrics(
  overrides: Partial<FocusQualityMetrics> = {},
): FocusQualityMetrics {
  return {
    sessionId: "test-session",
    timeInDeepFocus: 1200,
    timeInShallowFocus: 200,
    timeDistracted: 100,
    focusSegments: [],
    consistencyScore: 85,
    depthScore: 90,
    recoveryScore: 80,
    overallScore: 85,
    calculatedAt: Date.now(),
    ...overrides,
  };
}

export function createEngines() {
  const scoringEngine = new ScoringEngine();
  const completionEngine = new CompletionEngine(scoringEngine);
  return { scoringEngine, completionEngine };
}

export { CompletionEngine, ScoringEngine };
