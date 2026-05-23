import { useEffect, useState, useCallback, useRef } from 'react';
import { eventBus } from '../../../events';
import {
  fetchSquadMemberPresence,
  subscribeToSquadPresence,
  type SquadMemberPresence,
} from '../repository';

export type { SquadMemberPresence };

export interface SquadPresenceState {
  members: SquadMemberPresence[];
  focusingCount: number;
  isLoading: boolean;
  error: Error | null;
}

export function useSquadLivePresence(
  squadId: string | undefined,
  excludeUserId?: string,
): SquadPresenceState {
  const [members, setMembers] = useState<SquadMemberPresence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const channelRef = useRef<ReturnType<typeof subscribeToSquadPresence> | null>(null);

  const fetchPresence = useCallback(async () => {
    if (!squadId) {
      setMembers([]);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const presenceData = await fetchSquadMemberPresence(squadId, excludeUserId);
      setMembers(presenceData);
    } catch (err) {
      const wrapped = err instanceof Error ? err : new Error(String(err));
      setError(wrapped);
      eventBus.publish('analytics:track', {
        event: 'squad_presence_fetch_error',
        properties: { squadId, error: wrapped.message },
      });
    } finally {
      setIsLoading(false);
    }
  }, [squadId, excludeUserId]);

  useEffect(() => {
    if (!squadId) {
      setMembers([]);
      setIsLoading(false);
      return;
    }

    fetchPresence();

    const channel = subscribeToSquadPresence(
      squadId,
      (updatedMembers) => {
        setMembers(updatedMembers);
      },
      excludeUserId,
    );

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        eventBus.publish('analytics:track', {
          event: 'squad_presence_subscribed',
          properties: { squadId },
        });
      }
    });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
    };
  }, [squadId, fetchPresence, excludeUserId]);

  const focusingCount = members.filter((m) => m.isFocusing).length;
  return { members, focusingCount, isLoading, error };
}

export default useSquadLivePresence;
