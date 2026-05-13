import { type CoachUserState, type CoachState, type BehaviorProfile, type CoachMessage, CoachUserStateSchema } from "../schemas";
import * as repository from "../repository";
import { withRetry, RetryableError } from "../utils/retry";


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