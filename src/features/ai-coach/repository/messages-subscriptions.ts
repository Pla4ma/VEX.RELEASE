import { getSupabaseClient } from "../../../config/supabase";

const supabase = getSupabaseClient();

export function subscribeToCoachMessages(
  userId: string,
  onInsert: (payload: unknown) => void,
) {
  return supabase
    .channel(`coach-messages-${userId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "coach_messages",
        filter: `user_id=eq.${userId}`,
      },
      (payload) => onInsert(payload),
    )
    .subscribe();
}

export function subscribeToCoachState(
  userId: string,
  onUpdate: (payload: unknown) => void,
) {
  return supabase
    .channel(`coach-state-${userId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "coach_states",
        filter: `user_id=eq.${userId}`,
      },
      (payload) => onUpdate(payload),
    )
    .subscribe();
}

export function subscribeToComebackPlan(
  userId: string,
  onAny: () => void,
) {
  return supabase
    .channel(`comeback-${userId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "comeback_plans",
        filter: `user_id=eq.${userId}`,
      },
      () => onAny(),
    )
    .subscribe();
}

export function subscribeToRecommendations(
  userId: string,
  onAny: () => void,
) {
  return supabase
    .channel(`recommendations-${userId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "session_recommendations",
        filter: `user_id=eq.${userId}`,
      },
      () => onAny(),
    )
    .subscribe();
}
