import {
  presenceCallbacks,
  type PresenceStatus,
  type UserPresence,
} from './realtimeShared';

export function handlePresenceSync(state: Record<string, unknown[]>): void {
  const presences: UserPresence[] = [];
  Object.entries(state).forEach(([key, entries]) => {
    entries.forEach((entry) => {
      const presence = normalizePresenceEntry(key, entry);
      if (presence) {
        presences.push(presence);
      }
    });
  });
  presenceCallbacks.forEach((cb) => cb(presences));
}

export function normalizePresenceEntry(
  fallbackUserId: string,
  entry: unknown,
): UserPresence | null {
  if (!entry || typeof entry !== 'object') {
    return null;
  }
  const status = Reflect.get(entry, 'status');
  if (!isPresenceStatus(status)) {
    return null;
  }
  const userId = Reflect.get(entry, 'userId');
  const lastSeen = Reflect.get(entry, 'lastSeen');
  return {
    userId: typeof userId === 'string' ? userId : fallbackUserId,
    status,
    lastSeen: typeof lastSeen === 'number' ? lastSeen : Date.now(),
  };
}

export function isPresenceStatus(status: unknown): status is PresenceStatus {
  return (
    status === 'online' ||
    status === 'away' ||
    status === 'offline' ||
    status === 'in_session'
  );
}
