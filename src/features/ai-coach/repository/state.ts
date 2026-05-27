/**
 * AI Coach State Repository
 *
 * Handles coach state persistence and retrieval.
 */

import { getSupabaseClient } from "../../../config/supabase";
import type { CoachState } from "../types";
import { RepositoryError } from "./error";

const supabase = getSupabaseClient();

const TABLE_NAME = "coach_states";

/**
 * Fetch coach state for a user
 */
export async function fetchCoachState(
  userId: string,
): Promise<CoachState | null> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No state found
      return null;
    }
    throw new RepositoryError("fetchCoachState", error);
  }

  if (!data) {
    return null;
  }

  // Transform DB record to CoachState
  return {
    userId: data.user_id,
    currentState: data.current_state,
    previousState: data.previous_state,
    stateEnteredAt: data.state_entered_at,
    personaId: data.persona_id,
    behaviorProfile: data.behavior_profile,
    lastInterventionAt: data.last_intervention_at,
    interventionsToday: data.interventions_today,
    muteUntil: data.mute_until,
    reduceNotifications: data.reduce_notifications,
  };
}

/**
 * Upsert (create or update) coach state for a user
 */
export async function upsertCoachState(state: CoachState): Promise<CoachState> {
  const dbRecord = {
    user_id: state.userId,
    current_state: state.currentState,
    previous_state: state.previousState,
    state_entered_at: state.stateEnteredAt,
    persona_id: state.personaId,
    behavior_profile: state.behaviorProfile,
    last_intervention_at: state.lastInterventionAt,
    interventions_today: state.interventionsToday,
    mute_until: state.muteUntil,
    reduce_notifications: state.reduceNotifications,
    updated_at: Date.now(),
  };

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .upsert(dbRecord, { onConflict: "user_id" })
    .select()
    .single();

  if (error) {
    throw new RepositoryError("upsertCoachState", error);
  }

  if (!data) {
    throw new RepositoryError(
      "upsertCoachState",
      new Error("No data returned from upsert"),
    );
  }

  // Return the state that was passed in (it already has all fields)
  return state;
}
