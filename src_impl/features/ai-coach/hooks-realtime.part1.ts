import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSupabaseClient } from "../../config/supabase";
import { type CoachMessage, type CoachState, type ComebackPlan, type SessionRecommendation } from "./schemas";
import { COACH_QUERY_KEYS } from "./hooks-enhanced";
import { createDebugger } from "../../utils/debug";


export function useRealtimeCoachMessages(userId: string) {
  const queryClient = useQueryClient();
  const subscriptionRef = useRef<ReturnType<typeof subscribeToMessages> | null>(null);

  useEffect(() => {
    if (!userId) {return;}

    const supabase = getSupabaseClient();

    // Subscribe to new coach messages
    const subscription = supabase
      .channel(`coach-messages-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'coach_messages',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newMessage = payload.new as CoachMessage;

          // Update query cache
          queryClient.setQueryData(
            COACH_QUERY_KEYS.messages(userId),
            (old: { pages: Array<{ messages: CoachMessage[]; nextCursor?: number }> } | undefined) => {
              if (!old) {return old;}
              return {
                ...old,
                pages: [
                  {
                    ...old.pages[0],
                    messages: [newMessage, ...(old.pages[0]?.messages || [])],
                  },
                  ...old.pages.slice(1),
                ],
              };
            }
          );

          // Show notification if needed
          if (newMessage.deliveryMethod === 'PUSH' || newMessage.deliveryMethod === 'BOTH') {
            // Trigger local notification
            showLocalNotification(newMessage);
          }
        }
      )
      .subscribe();

    subscriptionRef.current = subscription;

    return () => {
      subscription.unsubscribe();
    };
  }, [userId, queryClient]);

  return { isSubscribed: !!subscriptionRef.current };
}

export function useRealtimeCoachState(userId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) {return;}

    const supabase = getSupabaseClient();

    const subscription = supabase
      .channel(`coach-state-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'coach_states',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newState = payload.new as CoachState;

          // Update query cache
          queryClient.setQueryData(
            COACH_QUERY_KEYS.state(userId),
            newState
          );
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId, queryClient]);
}

export function useRealtimeComebackPlan(userId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) {return;}

    const supabase = getSupabaseClient();

    const subscription = supabase
      .channel(`comeback-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // All events
          schema: 'public',
          table: 'comeback_plans',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          // Invalidate comeback query to refetch
          queryClient.invalidateQueries({
            queryKey: COACH_QUERY_KEYS.comeback(userId),
          });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId, queryClient]);
}

export function useRealtimeRecommendations(userId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) {return;}

    const supabase = getSupabaseClient();

    const subscription = supabase
      .channel(`recommendations-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'session_recommendations',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: COACH_QUERY_KEYS.recommendations(userId),
          });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId, queryClient]);
}