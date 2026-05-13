/**
 * Squad Sessions — Real-time presence via Supabase Realtime
 *
 * Shows who in your squad is currently focusing.
 * Uses Supabase channel to broadcast presence events.
 */

import { getSupabaseClient } from '../../config/supabase';
import { eventBus } from '../../events';

const supabase = getSupabaseClient();

interface PresenceState {
  userId: string;
  displayName: string;
  squadId: string;
  sessionId: string;
  focusMinutes: number;
  joinedAt: number;
}

let activeChannel: ReturnType<typeof supabase.channel> | null = null;

export function subscribeToSquadPresence(
  squadId: string,
  onPresenceChange: (active: PresenceState[]) => void,
): () => void {
  activeChannel = supabase.channel(`squad:${squadId}`, {
    config: { broadcast: { self: true }, presence: { key: '' } },
  });

  activeChannel
    .on('presence', { event: 'sync' }, () => {
      const state = activeChannel?.presenceState<PresenceState>() ?? {};
      const active: PresenceState[] = [];
      for (const key of Object.keys(state)) {
        const presences = state[key];
        if (presences && presences.length > 0 && presences[0]) {
          active.push(presences[0]);
        }
      }
      onPresenceChange(active);
    })
    .on('presence', { event: 'join' }, ({ key, newPresences }: { key: string; newPresences: PresenceState[] }) => {
      const member = newPresences[0];
      if (member) {
        eventBus.publish('squad.member_active', {
          squadId, userId: member.userId, sessionId: member.sessionId, timestamp: Date.now(),
        });
      }
    })
    .on('presence', { event: 'leave' }, ({ key, leftPresences }: { key: string; leftPresences: PresenceState[] }) => {
      const member = leftPresences[0];
      if (member) {
        eventBus.publish('squad.member_inactive', {
          squadId, userId: member.userId, timestamp: Date.now(),
        });
      }
    })
    .subscribe();

  return () => {
    void activeChannel?.unsubscribe();
    activeChannel = null;
  };
}

export async function trackPresence(state: PresenceState): Promise<void> {
  if (activeChannel) {
    await activeChannel.track(state);
  }
}

export async function untrackPresence(): Promise<void> {
  if (activeChannel) {
    await activeChannel.untrack();
  }
}
