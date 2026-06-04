import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import * as Sentry from '@sentry/react-native';
import * as ExpoNotifications from 'expo-notifications';
import {
  type CoachMessage,
  type CoachState,
} from '../schemas';
import { COACH_QUERY_KEYS } from '.';
import { createDebugger } from '../../../utils/debug';
import {
  subscribeToCoachMessages,
  subscribeToCoachState,
  subscribeToComebackPlan,
  subscribeToRecommendations,
} from '../repository/messages';

const debug = createDebugger('coach:realtime');

type Subscription = ReturnType<typeof subscribeToCoachMessages>;

export function useRealtimeCoachMessages(userId: string) {
  const queryClient = useQueryClient();
  const subscriptionRef = useRef<Subscription | null>(null);

  useEffect(() => {
    if (!userId) {
      return;
    }
    const subscription = subscribeToCoachMessages(userId, (payload: unknown) => {
      const record = payload as { new: CoachMessage };
      const newMessage = record.new;
      queryClient.setQueryData(
        COACH_QUERY_KEYS.messages(userId),
        (
          old:
            | {
                pages: Array<{
                  messages: CoachMessage[];
                  nextCursor?: number;
                }>;
              }
            | undefined,
        ) => {
          if (!old) {
            return old;
          }
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
        },
      );
      if (
        newMessage.deliveryMethod === 'PUSH' ||
        newMessage.deliveryMethod === 'BOTH'
      ) {
        showLocalNotification(newMessage);
      }
    });
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
    if (!userId) {
      return;
    }
    const subscription = subscribeToCoachState(userId, (payload: unknown) => {
      const record = payload as { new: CoachState };
      queryClient.setQueryData(COACH_QUERY_KEYS.state(userId), record.new);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [userId, queryClient]);
}

export function useRealtimeComebackPlan(userId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) {
      return;
    }
    const subscription = subscribeToComebackPlan(userId, () => {
      queryClient.invalidateQueries({
        queryKey: COACH_QUERY_KEYS.comeback(userId),
      });
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [userId, queryClient]);
}

export function useRealtimeRecommendations(userId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) {
      return;
    }
    const subscription = subscribeToRecommendations(userId, () => {
      queryClient.invalidateQueries({
        queryKey: COACH_QUERY_KEYS.recommendations(userId),
      });
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [userId, queryClient]);
}

export function useRealtimeCoach(userId: string) {
  useRealtimeCoachMessages(userId);
  useRealtimeCoachState(userId);
  useRealtimeComebackPlan(userId);
  useRealtimeRecommendations(userId);
}

async function showLocalNotification(message: CoachMessage): Promise<void> {
  try {
    const { status } = await ExpoNotifications.getPermissionsAsync();
    if (status !== 'granted') {return;}

    await ExpoNotifications.scheduleNotificationAsync({
      content: {
        title: 'VEX Coach',
        body: message.content,
        data: { messageId: message.id, type: message.category },
        sound: true,
      },
      trigger: null,
    });
  } catch (error) {
    Sentry.captureException(error, {
      tags: { feature: 'coach-local-notification' },
    });
  }
}
