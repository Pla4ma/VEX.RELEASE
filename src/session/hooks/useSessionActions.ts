import type { SessionConfig, SessionState, SessionSummary } from '../types';
import type { SessionService } from '../SessionService';

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

export function createSessionActions(service: SessionService): SessionActions {
  return {
    createSession: async (config: SessionConfig) => {
      return service.createCustomSession(config);
    },
    startSession: async (countdownSeconds: number = 0) => {
      await service.startSession(countdownSeconds);
    },
    pauseSession: async (reason?: string) => {
      await service.pauseSession(reason);
    },
    resumeSession: async () => {
      await service.resumeSession();
    },
    endSession: async () => {
      return service.completeSession();
    },
    abandonSession: async (reason?: string) => {
      await service.abandonSession(reason);
    },
    backgroundSession: async () => {
      await service.backgroundSession();
    },
    foregroundSession: async () => {
      await service.foregroundSession();
    },
    attemptRecovery: async (
      type: 'USER_RESUME' | 'STREAK_SAVE' | 'PARTIAL_CREDIT',
    ) => {
      return service.attemptRecovery(type);
    },
    applyStudyQuizBonus: (correctAnswers: number) => {
      service.applyStudyQuizBonus(correctAnswers);
    },
    getAntiCheatScore: () => {
      return service.getCurrentPurityScore();
    },
    getAntiCheatLabel: () => {
      return service.getPurityLabel();
    },
  };
}
