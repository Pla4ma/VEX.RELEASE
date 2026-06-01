/**
 * Persona Manager
 * Business logic for managing coach personas and user coach state
 *
 * Dependencies:
 * - Repository (data access)
 * - Session Analyzer (behavior profile building)
 * - Schemas (validation)
 */

import * as repository from './repository';
import {
  UpdateCoachPreferencesInputSchema,
  type CoachPersona,
  type CoachState,
  type CoachUserState,
  type UpdateCoachPreferencesInput,
  type BehaviorProfile,
  type BehaviorSignal,
  type SignalType,
} from './schemas';

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_PERSONA_ID = 'encouraging-mentor';
const COLD_START_THRESHOLD_DAYS = 7;
const HIGH_CONFIDENCE_THRESHOLD_DATA_POINTS = 20;

// ============================================================================
// Coach Persona Management
// ============================================================================

/**
 * Get available coach personas
 */
export async function getCoachPersonas(): Promise<CoachPersona[]> {
  return repository.fetchCoachPersonas();
}

/**
 * Get default persona
 */
export async function getDefaultPersona(): Promise<CoachPersona | null> {
  return repository.fetchCoachPersona(DEFAULT_PERSONA_ID);
}

// ============================================================================
// Coach State Management
// ============================================================================

/**
 * Get or create coach state for user
 */
export async function getOrCreateCoachState(
  userId: string,
): Promise<CoachState> {
  let state = await repository.fetchCoachState(userId);

  if (!state) {
    const behaviorProfile = await buildBehaviorProfileForState(userId);

    state = {
      userId,
      currentState: determineUserState(userId, behaviorProfile),
      previousState: null,
      stateEnteredAt: Date.now(),
      personaId: DEFAULT_PERSONA_ID,
      behaviorProfile,
      lastInterventionAt: null,
      interventionsToday: 0,
      muteUntil: null,
      reduceNotifications: false,
    };

    await repository.upsertCoachState(state);
  }

  return state;
}

async function buildBehaviorProfileForState(
  userId: string,
): Promise<BehaviorProfile> {
  const signals = await repository.fetchRecentBehaviorSignals(userId, 50);
  const dataPoints = signals.length;
  const profile: BehaviorProfile = {
    userId,
    signals: aggregateSignals(signals),
    lastUpdated: Date.now(),
    confidenceLevel: calculateConfidenceLevel(dataPoints),
    coldStart: dataPoints < 5,
    dataPoints,
  };
  await repository.upsertBehaviorProfile(profile);
  return profile;
}

function calculateConfidenceLevel(
  dataPoints: number,
): 'LOW' | 'MEDIUM' | 'HIGH' {
  if (dataPoints < 10) {return 'LOW';}
  if (dataPoints < HIGH_CONFIDENCE_THRESHOLD_DATA_POINTS) {return 'MEDIUM';}
  return 'HIGH';
}

function aggregateSignals(signals: BehaviorSignal[]): BehaviorSignal[] {
  const grouped = new Map<SignalType, BehaviorSignal>();
  for (const signal of signals) {
    const existing = grouped.get(signal.signalType);
    if (!existing || signal.timestamp > existing.timestamp) {
      grouped.set(signal.signalType, signal);
    }
  }
  return Array.from(grouped.values());
}

/**
 * Update coach state
 */
export async function updateCoachState(
  userId: string,
  newState: CoachUserState,
  context?: Record<string, unknown>,
): Promise<CoachState> {
  const currentState = await getOrCreateCoachState(userId);

  if (currentState.currentState !== newState) {
    const updatedState: CoachState = {
      ...currentState,
      previousState: currentState.currentState,
      currentState: newState,
      stateEnteredAt: Date.now(),
    };

    await repository.upsertCoachState(updatedState);

    // Emit state change event
    // eventBus.publish('coach:stateChanged', { userId, oldState: currentState.currentState, newState, context });

    return updatedState;
  }

  return currentState;
}

/**
 * Update user coach preferences
 */
export async function updateCoachPreferences(
  input: UpdateCoachPreferencesInput,
): Promise<CoachState> {
  const validated = UpdateCoachPreferencesInputSchema.parse(input);
  const state = await getOrCreateCoachState(validated.userId);

  const updatedState: CoachState = {
    ...state,
    ...(validated.personaId && { personaId: validated.personaId }),
    ...(validated.reduceNotifications !== undefined && {
      reduceNotifications: validated.reduceNotifications,
    }),
    ...(validated.muteUntil !== undefined && {
      muteUntil: validated.muteUntil,
    }),
  };

  return repository.upsertCoachState(updatedState);
}

// ============================================================================
// State Determination
// ============================================================================

function determineUserState(
  _userId: string,
  profile: { coldStart: boolean; confidenceLevel: string } | null,
): CoachUserState {
  if (!profile || profile.coldStart) {
    return 'COLD_START';
  }

  if (profile.confidenceLevel === 'LOW') {
    return 'LOW_CONFIDENCE';
  }

  return 'HIGH_CONFIDENCE';
}

// Export threshold for use in other modules
export { COLD_START_THRESHOLD_DAYS, DEFAULT_PERSONA_ID };
