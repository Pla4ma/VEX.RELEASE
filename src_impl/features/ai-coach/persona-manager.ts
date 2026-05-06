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
} from './schemas';

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_PERSONA_ID = 'encouraging-mentor';
const COLD_START_THRESHOLD_DAYS = 7;

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
export async function getOrCreateCoachState(userId: string): Promise<CoachState> {
  let state = await repository.fetchCoachState(userId);

  if (!state) {
    // Import dynamically to avoid circular dependency
    const { buildBehaviorProfile } = await import('./session-analyzer');
    const behaviorProfile = await buildBehaviorProfile(userId);

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

/**
 * Update coach state
 */
export async function updateCoachState(
  userId: string,
  newState: CoachUserState,
  context?: Record<string, unknown>
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
  input: UpdateCoachPreferencesInput
): Promise<CoachState> {
  const validated = UpdateCoachPreferencesInputSchema.parse(input);
  const state = await getOrCreateCoachState(validated.userId);

  const updatedState: CoachState = {
    ...state,
    ...(validated.personaId && { personaId: validated.personaId }),
    ...(validated.reduceNotifications !== undefined && { reduceNotifications: validated.reduceNotifications }),
    ...(validated.muteUntil !== undefined && { muteUntil: validated.muteUntil }),
  };

  return repository.upsertCoachState(updatedState);
}

// ============================================================================
// State Determination
// ============================================================================

function determineUserState(
  _userId: string,
  profile: { coldStart: boolean; confidenceLevel: string } | null
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
