export interface UserPresence {
    userId: string;
    status: PresenceStatus;
    currentSquadId?: string | null;
    currentSessionId?: string | null;
    lastSeen: number;
    metadata?: Record<string, unknown>;
}

export interface SquadPresence {
    squadId: string;
    members: Map<string, UserPresence>;
    activeCount: number;
    inSessionCount: number;
}

export interface BroadcastMessage {
    type: 'activity' | 'notification' | 'sync' | 'typing';
    payload: unknown;
    senderId: string;
    timestamp: number;
}

export type PresenceStatus = 'online' | 'away' | 'offline' | 'in_session';
