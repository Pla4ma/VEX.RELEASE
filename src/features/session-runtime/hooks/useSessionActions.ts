import type { SessionConfig, SessionState, SessionSummary } from '../types';
import type { SessionOrchestrator } from '../SessionOrchestrator';

export interface SessionActions {
  createSession: (config: SessionConfig) => Promise<SessionState>;
  startSession: (countdownSeconds?: number) => Promise<void>;
  pauseSession: (reason?: string) => Promise<void>;
  resumeSession: () => Promise<void>;
  endSession: () => Promise<SessionSummary>;
  abandonSession: (reason?: string) => Promise<void>;
  backgroundSession: () => Promise<void>;
  foregroundSession: () => Promise<void>;
  attemptRecovery: (
    type: 'USER_RESUME' | 'STREAK_SAVE' | 'PARTIAL_CREDIT',
  ) => Promise<boolean>;
  applyStudyQuizBonus: (correctAnswers: number) => void;
  getAntiCheatScore: () => number;
  getAntiCheatLabel: () => 'Elite' | 'Good' | 'Okay' | 'Distracted';
}

export function createSessionActions(
  orchestrator: SessionOrchestrator,
): SessionActions {
  return {
    createSession: async (config: SessionConfig) => {
      return orchestrator.createSession(config);
    },
    startSession: async (countdownSeconds: number = 0) => {
      await orchestrator.startSession(countdownSeconds);
    },
    pauseSession: async (reason?: string) => {
      await orchestrator.pauseSession(reason);
    },
    resumeSession: async () => {
      await orchestrator.resumeSession();
    },
    endSession: async () => {
      return orchestrator.completeSession();
    },
    abandonSession: async (reason?: string) => {
      await orchestrator.abandonSession(reason);
    },
    backgroundSession: async () => {
      await orchestrator.backgroundSession();
    },
    foregroundSession: async () => {
      await orchestrator.foregroundSession();
    },
    attemptRecovery: async (
      type: 'USER_RESUME' | 'STREAK_SAVE' | 'PARTIAL_CREDIT',
    ) => {
      return orchestrator.attemptRecovery(type);
    },
    applyStudyQuizBonus: (correctAnswers: number) => {
      orchestrator.applyStudyQuizBonus(correctAnswers);
    },
    getAntiCheatScore: () => {
      return orchestrator.getCurrentPurityScore();
    },
    getAntiCheatLabel: () => {
      return orchestrator.getPurityLabel();
    },
  };
}
