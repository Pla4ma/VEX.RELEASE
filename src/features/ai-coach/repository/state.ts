/**
 * AI Coach State Repository
 *
 * Handles coach state persistence and retrieval.
 */

import { z } from 'zod';
import { getSupabaseClient } from '../../../config/supabase';
import type { CoachState } from '../types';
import { RepositoryError } from './error';
import { tableColumns } from '../../../lib/repository/tableColumns';

const supabase = getSupabaseClient();

const TABLE_NAME = 'coach_states';

const CoachStateRowSchema = z.object({
  user_id: z.string(),
  current_state: z.string(),
  previous_state: z.string().nullable().optional(),
  state_entered_at: z.number().nullable().optional(),
  persona_id: z.string().nullable().optional(),
  behavior_profile: z.unknown().nullable().optional(),
  last_intervention_at: z.number().nullable().optional(),
  interventions_today: z.number().optional(),
  mute_until: z.number().nullable().optional(),
  reduce_notifications: z.boolean().optional(),
});

/**
 * Fetch coach state for a user
 */
export async function fetchCoachState(
  userId: string,
): Promise<CoachState | null> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('user_id,current_state,previous_state,state_entered_at,persona_id,behavior_profile,last_intervention_at,interventions_today,mute_until,reduce_notifications')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No state found
      return null;
    }
    throw new RepositoryError('fetchCoachState', error);
  }

  if (!data) {
    return null;
  }

  const parsed = CoachStateRowSchema.parse(data);
  return {
    userId: parsed.user_id,
    currentState: parsed.current_state,
    previousState: parsed.previous_state ?? null,
    stateEnteredAt: parsed.state_entered_at ?? null,
    personaId: parsed.persona_id ?? null,
    behaviorProfile: parsed.behavior_profile,
    lastInterventionAt: parsed.last_intervention_at ?? null,
    interventionsToday: parsed.interventions_today ?? 0,
    muteUntil: parsed.mute_until ?? null,
    reduceNotifications: parsed.reduce_notifications ?? false,
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
    .upsert(dbRecord, { onConflict: 'user_id' })
    .select(tableColumns(TABLE_NAME))
    .single();

  if (error) {
    throw new RepositoryError('upsertCoachState', error);
  }

  if (!data) {
    throw new RepositoryError(
      'upsertCoachState',
      new Error('No data returned from upsert'),
    );
  }

  const parsed = CoachStateRowSchema.parse(data);
  return {
    userId: parsed.user_id,
    currentState: parsed.current_state,
    previousState: parsed.previous_state ?? null,
    stateEnteredAt: parsed.state_entered_at ?? null,
    personaId: parsed.persona_id ?? null,
    behaviorProfile: parsed.behavior_profile,
    lastInterventionAt: parsed.last_intervention_at ?? null,
    interventionsToday: parsed.interventions_today ?? 0,
    muteUntil: parsed.mute_until ?? null,
    reduceNotifications: parsed.reduce_notifications ?? false,
  };
}
