import {
  type CoachUserState,
  type CoachState,
  type BehaviorProfile,
} from '../schemas';
import * as repository from '../repository';
import { withRetry } from '../utils/retry';
import { STATE_CONFIG } from './coach-state-config';
import { determineOptimalState } from './coach-state-resolver';

export type { CoachSignals } from './coach-state-resolver';
export {
  resolveCoachState,
  determineOptimalState,
} from './coach-state-resolver';
export { STATE_CONFIG, type StateConfig } from './coach-state-config';

export async function transitionState(
  userId: string,
  newState: CoachUserState,
  context?: Record<string, unknown>,
  force: boolean = false,
): Promise<CoachState> {
  const currentState = await getCurrentStateSafe(userId);
  const previousStateValue = currentState.currentState;

  if (!force && !isValidTransition(previousStateValue, newState)) {
    throw new StateTransitionError(
      `Invalid transition: ${previousStateValue} -> ${newState}`,
      previousStateValue,
      newState,
    );
  }

  const currentConfig = STATE_CONFIG[previousStateValue];
  if (currentConfig?.onExit) {
    await withRetry(
      () => currentConfig.onExit!(currentState, newState),
      { maxAttempts: 3 },
      'state-exit-action',
    );
  }

  const newStateRecord: CoachState = {
    ...currentState,
    currentState: newState,
    previousState: previousStateValue,
    stateEnteredAt: Date.now(),
  };

  await withRetry(
    () => repository.upsertCoachState(newStateRecord),
    { maxAttempts: 3 },
    'persist-state',
  );

  const newConfig = STATE_CONFIG[newState];
  if (newConfig?.onEntry) {
    await withRetry(
      () => newConfig.onEntry!(newStateRecord, previousStateValue),
      { maxAttempts: 3 },
      'state-entry-action',
    );
  }

  emitStateChangedEvent(userId, previousStateValue, newState, context);
  return newStateRecord;
}

export async function checkAutoTransitions(
  userId: string,
): Promise<CoachState | null> {
  const state = await getCurrentStateSafe(userId);
  const config = STATE_CONFIG[state.currentState];

  if (!config.maxDurationHours) {return null;}

  const hoursInState = (Date.now() - state.stateEnteredAt) / (1000 * 60 * 60);
  if (hoursInState > config.maxDurationHours) {
    const profile = await repository.fetchBehaviorProfile(userId);
    const nextState = await determineOptimalState(userId, profile);
    if (nextState !== state.currentState) {
      return transitionState(userId, nextState, { autoTransition: true });
    }
  }

  return null;
}

function isValidTransition(from: CoachUserState, to: CoachUserState): boolean {
  if (from === to) {return true;}
  const config = STATE_CONFIG[from];
  return config.allowedTransitions.includes(to);
}

async function getCurrentStateSafe(userId: string): Promise<CoachState> {
  const state = await repository.fetchCoachState(userId);
  if (state) {return state;}

  const defaultState: CoachState = {
    userId,
    currentState: 'COLD_START',
    previousState: null,
    stateEnteredAt: Date.now(),
    personaId: '00000000-0000-4000-a000-000000000001',
    behaviorProfile: null,
    lastInterventionAt: null,
    interventionsToday: 0,
    muteUntil: null,
    reduceNotifications: false,
  };

  return repository.upsertCoachState(defaultState);
}

function emitStateChangedEvent(
  userId: string,
  previousState: CoachUserState | null,
  newState: CoachUserState,
  context?: Record<string, unknown>,
): void {
  // Delegated to event bus - wired at integration layer
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
