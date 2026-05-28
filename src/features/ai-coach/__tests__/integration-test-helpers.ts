import { jest } from "@jest/globals";
import * as coachService from "../service";
import * as coachRepository from "../repository";
import {
  handleSessionCompleted,
  handleStreakRiskDetected,
  handleStreakBroken,
  handleLevelUp,
  handleChallengeExpiring,
  handleBossTimeoutWarning,
} from "../integration";
import type {
  CoachState,
  BehaviorProfile,
  ComebackPlan,
  CoachMessage,
} from "../schemas";

jest.mock("../service");
jest.mock("../repository");
jest.mock("../analytics");
jest.mock("../../session/service", () => ({
  recordSession: jest.fn(),
  calculateQuality: jest.fn(),
}));
jest.mock("../../streaks/service", () => ({
  updateStreak: jest.fn(),
  checkStreakRisk: jest.fn(),
  getCurrentStreak: jest.fn(),
}));
jest.mock("../../progression/service", () => ({
  addXP: jest.fn(),
  getLevel: jest.fn(),
  checkLevelUp: jest.fn(),
}));
jest.mock("../../challenges/service", () => ({
  getActiveChallenges: jest.fn(),
  updateChallengeProgress: jest.fn(),
}));
jest.mock("../../boss/service", () => ({
  getActiveBoss: jest.fn(),
  calculateDamage: jest.fn(),
}));

export const mockUserId = "user-123";
export {
  coachService,
  coachRepository,
  handleSessionCompleted,
  handleStreakRiskDetected,
  handleStreakBroken,
  handleLevelUp,
  handleChallengeExpiring,
  handleBossTimeoutWarning,
};
export type { CoachState, BehaviorProfile, ComebackPlan, CoachMessage };
