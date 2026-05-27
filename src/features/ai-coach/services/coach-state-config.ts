import { type CoachUserState, type CoachState } from "../schemas";
import * as repository from "../repository";

export interface StateConfig {
  onEntry?: (
    state: CoachState,
    previousState: CoachUserState | null,
  ) => Promise<void>;
  onExit?: (state: CoachState, nextState: CoachUserState) => Promise<void>;
  allowedTransitions: CoachUserState[];
  maxDurationHours?: number;
  requiredDataPoints?: number;
}

async function ensureComebackPlan(userId: string): Promise<void> {
  const existing = await repository.fetchActiveComebackPlan(userId);
  if (!existing) {
    // Comeback plan creation delegated to comeback service
  }
}

async function sendPostFailureSupport(userId: string): Promise<void> {
  // Delegated to intervention engine
}

async function sendMilestoneCelebration(
  userId: string,
  state: CoachState,
): Promise<void> {
  // Delegated to intervention engine
}

async function reduceNotifications(userId: string): Promise<void> {
  const state = await repository.fetchCoachState(userId);
  if (state) {
    await repository.upsertCoachState({
      ...state,
      reduceNotifications: true,
    });
  }
}

async function restoreNotifications(userId: string): Promise<void> {
  const state = await repository.fetchCoachState(userId);
  if (state) {
    await repository.upsertCoachState({
      ...state,
      reduceNotifications: false,
      muteUntil: null,
    });
  }
}

async function muteAllNotifications(userId: string): Promise<void> {
  const state = await repository.fetchCoachState(userId);
  if (state) {
    await repository.upsertCoachState({
      ...state,
      reduceNotifications: true,
      muteUntil: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });
  }
}

export const STATE_CONFIG: Record<CoachUserState, StateConfig> = {
  COLD_START: {
    allowedTransitions: ["LOW_CONFIDENCE", "STREAK_AT_RISK"],
    requiredDataPoints: 0,
  },
  LOW_CONFIDENCE: {
    allowedTransitions: ["HIGH_CONFIDENCE", "STREAK_AT_RISK", "COLD_START"],
    requiredDataPoints: 5,
    maxDurationHours: 168,
  },
  HIGH_CONFIDENCE: {
    allowedTransitions: [
      "STREAK_AT_RISK",
      "COMEBACK_MODE",
      "OVERLOAD_PROTECTION",
      "MUTED_MODE",
    ],
    requiredDataPoints: 20,
  },
  STREAK_AT_RISK: {
    allowedTransitions: [
      "HIGH_CONFIDENCE",
      "POST_FAILURE_SUPPORT",
      "MUTED_MODE",
    ],
    maxDurationHours: 48,
  },
  COMEBACK_MODE: {
    onEntry: async (state) => {
      await ensureComebackPlan(state.userId);
    },
    allowedTransitions: [
      "HIGH_CONFIDENCE",
      "POST_FAILURE_SUPPORT",
      "MUTED_MODE",
    ],
    maxDurationHours: 168,
  },
  POST_FAILURE_SUPPORT: {
    onEntry: async (state) => {
      await sendPostFailureSupport(state.userId);
    },
    allowedTransitions: ["COMEBACK_MODE", "LOW_CONFIDENCE", "MUTED_MODE"],
    maxDurationHours: 72,
  },
  MILESTONE_HYPE: {
    onEntry: async (state) => {
      await sendMilestoneCelebration(state.userId, state);
    },
    allowedTransitions: ["HIGH_CONFIDENCE", "STREAK_AT_RISK"],
    maxDurationHours: 24,
  },
  OVERLOAD_PROTECTION: {
    onEntry: async (state) => {
      await reduceNotifications(state.userId);
    },
    onExit: async (state) => {
      await restoreNotifications(state.userId);
    },
    allowedTransitions: ["HIGH_CONFIDENCE", "MUTED_MODE"],
    maxDurationHours: 24,
  },
  MUTED_MODE: {
    onEntry: async (state) => {
      await muteAllNotifications(state.userId);
    },
    onExit: async (state) => {
      await restoreNotifications(state.userId);
    },
    allowedTransitions: ["HIGH_CONFIDENCE", "LOW_CONFIDENCE"],
    maxDurationHours: 168,
  },
};
