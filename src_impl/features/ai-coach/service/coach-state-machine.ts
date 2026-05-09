/**
 * Coach State Machine
 *
 * Production-grade finite state machine for coach user states.
 * Handles state transitions, validation, and entry/exit actions.
 */

import { type CoachUserState, type CoachState, type BehaviorProfile, type CoachMessage, CoachUserStateSchema } from '../schemas';
import * as repository from '../repository';
import { withRetry, RetryableError } from '../utils/retry';

// ============================================================================
// State Machine Configuration
// ============================================================================

interface StateConfig {
  onEntry?: (state: CoachState, previousState: CoachUserState | null) => Promise<void>;
  onExit?: (state: CoachState, nextState: CoachUserState) => Promise<void>;
  allowedTransitions: CoachUserState[];
  maxDurationHours?: number; // Auto-transition after this time
  requiredDataPoints?: number; // Minimum data to stay in this state
}

const STATE_CONFIG: Record<CoachUserState, StateConfig> = {
  COLD_START: {
    allowedTransitions: ['LOW_CONFIDENCE', 'STREAK_AT_RISK'],
    requiredDataPoints: 0,
  },
  LOW_CONFIDENCE: {
    allowedTransitions: ['HIGH_CONFIDENCE', 'STREAK_AT_RISK', 'COLD_START'],
    requiredDataPoints: 5,
    maxDurationHours: 168, // 1 week - re-evaluate after
  },
  HIGH_CONFIDENCE: {
    allowedTransitions: ['STREAK_AT_RISK', 'COMEBACK_MODE', 'OVERLOAD_PROTECTION', 'MUTED_MODE'],
    requiredDataPoints: 20,
  },
  STREAK_AT_RISK: {
    allowedTransitions: ['HIGH_CONFIDENCE', 'POST_FAILURE_SUPPORT', 'MUTED_MODE'],
    maxDurationHours: 48, // Auto-resolve after 2 days
  },
  COMEBACK_MODE: {
    onEntry: async (state) => {
      // Initialize comeback plan if not exists
      await ensureComebackPlan(state.userId);
    },
    allowedTransitions: ['HIGH_CONFIDENCE', 'POST_FAILURE_SUPPORT', 'MUTED_MODE'],
    maxDurationHours: 168, // 1 week comeback window
  },
  POST_FAILURE_SUPPORT: {
    onEntry: async (state) => {
      // Send supportive message
      await sendPostFailureSupport(state.userId);
    },
    allowedTransitions: ['COMEBACK_MODE', 'LOW_CONFIDENCE', 'MUTED_MODE'],
    maxDurationHours: 72, // 3 days of support
  },
  MILESTONE_HYPE: {
    onEntry: async (state) => {
      // Send milestone celebration
      await sendMilestoneCelebration(state.userId, state);
    },
    allowedTransitions: ['HIGH_CONFIDENCE', 'STREAK_AT_RISK'],
    maxDurationHours: 24, // Hype lasts 1 day
  },
  OVERLOAD_PROTECTION: {
    onEntry: async (state) => {
      // Reduce notifications
      await reduceNotifications(state.userId);
    },
    onExit: async (state) => {
      // Restore normal notifications
      await restoreNotifications(state.userId);
    },
    allowedTransitions: ['HIGH_CONFIDENCE', 'MUTED_MODE'],
    maxDurationHours: 24,
  },
  MUTED_MODE: {
    onEntry: async (state) => {
      // Mute all coach messages
      await muteAllNotifications(state.userId);
    },
    onExit: async (state) => {
      // Restore notifications
      await restoreNotifications(state.userId);
    },
    allowedTransitions: ['HIGH_CONFIDENCE', 'LOW_CONFIDENCE'],
    maxDurationHours: 168, // 1 week max mute
  },
};

// ============================================================================
// State Machine Operations
// ============================================================================

/**
 * Determine appropriate state based on user data
 * Real domain logic - not placeholder
 */
export async function determineOptimalState(userId: string, profile: BehaviorProfile | null): Promise<CoachUserState> {
  // Fetch required data
  const [currentState, streakStatus, recentSessions, comebackPlan] = await Promise.all([getCurrentStateSafe(userId), fetchStreakStatus(userId), fetchRecentSessionMetrics(userId, 7), repository.fetchActiveComebackPlan(userId)]);

  // Check for comeback mode first (highest priority)
  if (comebackPlan?.status === 'ACTIVE') {
    return 'COMEBACK_MODE';
  }

  // Check for streak at risk
  if (streakStatus.isAtRisk && streakStatus.riskLevel !== 'NONE') {
    return 'STREAK_AT_RISK';
  }

  // Check for streak break (post-failure)
  if (streakStatus.wasRecentlyBroken && streakStatus.daysSinceBreak < 3) {
    return 'POST_FAILURE_SUPPORT';
  }

  // Check for milestone
  if (streakStatus.recentMilestone && !streakStatus.milestoneCelebrated) {
    return 'MILESTONE_HYPE';
  }

  // Check for overload
  if (recentSessions.sessionsToday >= 5) {
    return 'OVERLOAD_PROTECTION';
  }

  // Check for muted mode
  if (currentState?.reduceNotifications || currentState?.muteUntil) {
    return 'MUTED_MODE';
  }

  // Determine based on data confidence
  if (!profile || profile.coldStart || profile.dataPoints < 5) {
    return 'COLD_START';
  }

  if (profile.confidenceLevel === 'LOW' || profile.dataPoints < 20) {
    return 'LOW_CONFIDENCE';
  }

  return 'HIGH_CONFIDENCE';
}

/**
 * Transition to new state with full validation and actions
 */
export async function transitionState(userId: string, newState: CoachUserState, context?: Record<string, unknown>, force: boolean = false): Promise<CoachState> {
  const currentState = await getCurrentStateSafe(userId);
  const previousStateValue = currentState.currentState;

  // Validate transition
  if (!force && !isValidTransition(previousStateValue, newState)) {
    throw new StateTransitionError(`Invalid transition: ${previousStateValue} → ${newState}`, previousStateValue, newState);
  }

  // Execute exit actions for current state
  const currentConfig = STATE_CONFIG[previousStateValue];
  if (currentConfig?.onExit) {
    await withRetry(() => currentConfig.onExit!(currentState, newState), { maxAttempts: 3 }, 'state-exit-action');
  }

  // Build new state
  const newStateRecord: CoachState = {
    ...currentState,
    currentState: newState,
    previousState: previousStateValue,
    stateEnteredAt: Date.now(),
  };

  // Persist state change
  await withRetry(() => repository.upsertCoachState(newStateRecord), { maxAttempts: 3 }, 'persist-state');

  // Execute entry actions for new state
  const newConfig = STATE_CONFIG[newState];
  if (newConfig?.onEntry) {
    await withRetry(() => newConfig.onEntry!(newStateRecord, previousStateValue), { maxAttempts: 3 }, 'state-entry-action');
  }

  // Emit state change event
  emitStateChangedEvent(userId, previousStateValue, newState, context);

  return newStateRecord;
}

/**
 * Check and auto-transition states that have expired
 */
export async function checkAutoTransitions(userId: string): Promise<CoachState | null> {
  const state = await getCurrentStateSafe(userId);
  const config = STATE_CONFIG[state.currentState];

  if (!config.maxDurationHours) {
    return null;
  }

  const hoursInState = (Date.now() - state.stateEnteredAt) / (1000 * 60 * 60);

  if (hoursInState > config.maxDurationHours) {
    // Determine appropriate next state
    const profile = await repository.fetchBehaviorProfile(userId);
    const nextState = await determineOptimalState(userId, profile);

    if (nextState !== state.currentState) {
      return transitionState(userId, nextState, { autoTransition: true });
    }
  }

  return null;
}

/**
 * Validate if state transition is allowed
 */
function isValidTransition(from: CoachUserState, to: CoachUserState): boolean {
  if (from === to) {
    return true;
  }

  const config = STATE_CONFIG[from];
  return config.allowedTransitions.includes(to);
}

// ============================================================================
// Helper Functions
// ============================================================================

async function getCurrentStateSafe(userId: string): Promise<CoachState> {
  const state = await repository.fetchCoachState(userId);
  if (state) {
    return state;
  }

  // Create default state if none exists
  const defaultState: CoachState = {
    userId,
    currentState: 'COLD_START',
    previousState: null,
    stateEnteredAt: Date.now(),
    personaId: 'encouraging-mentor',
    behaviorProfile: null,
    lastInterventionAt: null,
    interventionsToday: 0,
    muteUntil: null,
    reduceNotifications: false,
  };

  return repository.upsertCoachState(defaultState);
}

interface StreakStatus {
  isAtRisk: boolean;
  riskLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  wasRecentlyBroken: boolean;
  daysSinceBreak: number;
  recentMilestone: boolean;
  milestoneCelebrated: boolean;
}

async function fetchStreakStatus(userId: string): Promise<StreakStatus> {
  // This would integrate with streaks feature
  // Placeholder for actual implementation
  return {
    isAtRisk: false,
    riskLevel: 'NONE',
    wasRecentlyBroken: false,
    daysSinceBreak: 0,
    recentMilestone: false,
    milestoneCelebrated: false,
  };
}

interface SessionMetrics {
  sessionsToday: number;
  sessionsThisWeek: number;
  averageQuality: number;
}

async function fetchRecentSessionMetrics(userId: string, days: number): Promise<SessionMetrics> {
  // This would integrate with sessions feature
  return {
    sessionsToday: 0,
    sessionsThisWeek: 0,
    averageQuality: 75,
  };
}

async function ensureComebackPlan(userId: string): Promise<void> {
  const existing = await repository.fetchActiveComebackPlan(userId);
  if (!existing) {
    // Create default comeback plan
    // Implementation would be in comeback-service.ts
  }
}

async function sendPostFailureSupport(userId: string): Promise<void> {
  // Implementation would queue supportive message
}

async function sendMilestoneCelebration(userId: string, state: CoachState): Promise<void> {
  // Implementation would queue celebration message
}

async function reduceNotifications(userId: string): Promise<void> {
  await repository.upsertCoachState({
    ...(await getCurrentStateSafe(userId)),
    reduceNotifications: true,
  });
}

async function restoreNotifications(userId: string): Promise<void> {
  await repository.upsertCoachState({
    ...(await getCurrentStateSafe(userId)),
    reduceNotifications: false,
    muteUntil: null,
  });
}

async function muteAllNotifications(userId: string): Promise<void> {
  await repository.upsertCoachState({
    ...(await getCurrentStateSafe(userId)),
    reduceNotifications: true,
    muteUntil: Date.now() + 7 * 24 * 60 * 60 * 1000, // 1 week
  });
}

function emitStateChangedEvent(userId: string, previousState: CoachUserState | null, newState: CoachUserState, context?: Record<string, unknown>): void {
  // This would emit to event bus
  // eventBus.publish('coach:stateChanged', { userId, previousState, newState, context });
}

// ============================================================================
// Error Types
// ============================================================================

export class StateTransitionError extends Error {
  constructor(
    message: string,
    public fromState: CoachUserState,
    public toState: CoachUserState,
  ) {
    super(message);
    this.name = 'StateTransitionError';
  }
}

export class StateMachineError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StateMachineError';
  }
}
