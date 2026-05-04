/**
 * Squad State Persistence
 *
 * Handles offline storage, sync, and conflict resolution.
 */

import { getSupabaseClient } from '../../config/supabase';
import { SquadRoleSchema, type Squad, type SquadMember, type SquadInvite } from './schemas';
import { createDebugger } from '../../utils/debug';

const debug = createDebugger('squads:persistence');

// Offline storage keys
const STORAGE_KEYS = {
  squadCache: (squadId: string) => `squad:cache:${squadId}`,
  squadMembers: (squadId: string) => `squad:members:${squadId}`,
  pendingOperations: 'squad:pending_ops',
  sessionState: (sessionId: string) => `squad:session:${sessionId}`,
} as const;

// Pending operation types
interface PendingOperation {
  id: string;
  type: 'create' | 'update' | 'delete' | 'join' | 'leave' | 'kick' | 'invite' | 'role_change';
  entityType: 'squad' | 'member' | 'session' | 'invite';
  entityId: string;
  payload: Record<string, unknown>;
  timestamp: number;
  retryCount: number;
  lastError?: string;
}

class SquadPersistenceManager {
  private supabase = getSupabaseClient();
  private pendingOps: PendingOperation[] = [];
  private isOnline = true;
  private syncInProgress = false;

  // Cache management
  async cacheSquad(squad: Squad): Promise<void> {
    const key = STORAGE_KEYS.squadCache(squad.id);
    const data = {
      squad,
      cachedAt: Date.now(),
      version: 1,
    };
    // In real implementation, use AsyncStorage or similar
    // await AsyncStorage.setItem(key, JSON.stringify(data));
  }

  async getCachedSquad(squadId: string): Promise<{ squad: Squad; cachedAt: number } | null> {
    const key = STORAGE_KEYS.squadCache(squadId);
    // const data = await AsyncStorage.getItem(key);
    // if (!data) return null;
    // const parsed = JSON.parse(data);
    // return { squad: parsed.squad, cachedAt: parsed.cachedAt };
    return null; // Placeholder
  }

  // Pending operations queue
  queueOperation(operation: Omit<PendingOperation, 'id' | 'timestamp' | 'retryCount'>): string {
    const id = crypto.randomUUID();
    const pendingOp: PendingOperation = {
      ...operation,
      id,
      timestamp: Date.now(),
      retryCount: 0,
    };
    this.pendingOps.push(pendingOp);
    this.persistPendingOps();

    if (this.isOnline) {
      this.processQueue();
    }

    return id;
  }

  async processQueue(): Promise<void> {
    if (this.syncInProgress || this.pendingOps.length === 0) {return;}

    this.syncInProgress = true;

    const opsToProcess = [...this.pendingOps];
    const failedOps: PendingOperation[] = [];

    for (const op of opsToProcess) {
      try {
        await this.executeOperation(op);
        // Remove from pending
        this.pendingOps = this.pendingOps.filter(p => p.id !== op.id);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        if (op.retryCount < 3) {
          failedOps.push({
            ...op,
            retryCount: op.retryCount + 1,
            lastError: errorMessage,
          });
        } else {
          // Max retries exceeded - log for manual handling
          debug.error(`Operation ${op.id} failed permanently:`, new Error(errorMessage));
        }
      }
    }

    // Update pending with failed ops that will be retried
    this.pendingOps = [...this.pendingOps, ...failedOps];
    await this.persistPendingOps();

    this.syncInProgress = false;
  }

  private async executeOperation(op: PendingOperation): Promise<void> {
    switch (op.type) {
      case 'create':
        if (op.entityType === 'squad') {
          const { error } = await this.supabase.from('squads').insert(op.payload);
          if (error) {throw error;}
        }
        break;
      case 'update':
        if (op.entityType === 'squad') {
          const { error } = await this.supabase.from('squads').update(op.payload).eq('id', op.entityId);
          if (error) {throw error;}
        } else if (op.entityType === 'member') {
          const { error } = await this.supabase.from('squad_members').update(op.payload).eq('id', op.entityId);
          if (error) {throw error;}
        }
        break;
      case 'join':
        {
          const { error } = await this.supabase.from('squad_members').insert(op.payload);
          if (error) {throw error;}
        }
        break;
      case 'leave':
        {
          const { error } = await this.supabase.from('squad_members').delete().eq('id', op.entityId);
          if (error) {throw error;}
        }
        break;
      default:
        throw new Error(`Unknown operation type: ${op.type}`);
    }
  }

  private async persistPendingOps(): Promise<void> {
    // await AsyncStorage.setItem(STORAGE_KEYS.pendingOperations, JSON.stringify(this.pendingOps));
  }

  // Conflict resolution
  async resolveConflict(
    localState: Squad,
    remoteState: Squad,
    lastSyncedAt: number
  ): Promise<Squad> {
    const conflicts: Array<{ field: string; local: unknown; remote: unknown }> = [];

    // Detect conflicts
    if (localState.name !== remoteState.name) {
      conflicts.push({ field: 'name', local: localState.name, remote: remoteState.name });
    }
    if (localState.description !== remoteState.description) {
      conflicts.push({ field: 'description', local: localState.description, remote: remoteState.description });
    }
    if (localState.maxMembers !== remoteState.maxMembers) {
      conflicts.push({ field: 'maxMembers', local: localState.maxMembers, remote: remoteState.maxMembers });
    }

    if (conflicts.length === 0) {
      return remoteState; // No conflicts, use remote
    }

    // Resolution strategy: most recent wins
    const localUpdatedAt = localState.updatedAt;
    const remoteUpdatedAt = remoteState.updatedAt;

    let resolved: Squad = { ...remoteState };

    for (const conflict of conflicts) {
      if (localUpdatedAt > remoteUpdatedAt) {
        // Local is newer
        resolved = resolveLocalConflict(resolved, conflict);
      }
      // else keep remote (already in resolved)
    }

    // Log conflict for analytics
    debug.info('Conflict resolved:', {
      squadId: localState.id,
      conflicts: conflicts.map(c => c.field),
      resolution: localUpdatedAt > remoteUpdatedAt ? 'LOCAL' : 'REMOTE',
    });

    return resolved;
  }

  // Sync status
  getPendingOperationCount(): number {
    return this.pendingOps.length;
  }

  getSyncStatus(): {
    pending: number;
    inProgress: boolean;
    isOnline: boolean;
  } {
    return {
      pending: this.pendingOps.length,
      inProgress: this.syncInProgress,
      isOnline: this.isOnline,
    };
  }

  setOnlineStatus(online: boolean): void {
    this.isOnline = online;
    if (online) {
      this.processQueue();
    }
  }

  // Session persistence
  async persistSessionState(sessionId: string, state: {
    currentFocusTime: number;
    isActive: boolean;
    participants: string[];
    startedAt: number;
  }): Promise<void> {
    const key = STORAGE_KEYS.sessionState(sessionId);
    // await AsyncStorage.setItem(key, JSON.stringify({
    //   ...state,
    //   persistedAt: Date.now(),
    // }));
  }

  async recoverSessionState(sessionId: string): Promise<{
    currentFocusTime: number;
    isActive: boolean;
    participants: string[];
    startedAt: number;
  } | null> {
    const key = STORAGE_KEYS.sessionState(sessionId);
    // const data = await AsyncStorage.getItem(key);
    // if (!data) return null;
    // return JSON.parse(data);
    return null; // Placeholder
  }

  async clearSessionState(sessionId: string): Promise<void> {
    const key = STORAGE_KEYS.sessionState(sessionId);
    // await AsyncStorage.removeItem(key);
  }
}

// Export singleton
export const squadPersistence = new SquadPersistenceManager();

// Optimistic update helpers
export function createOptimisticSquadMember(
  squadId: string,
  userId: string,
  role: string,
  displayName: string
): SquadMember {
  return {
    squadId,
    userId,
    role: SquadRoleSchema.parse(role),
    isActive: true,
    joinedAt: Date.now(),
    contributionScore: 0,
    lastActiveAt: Date.now(),
    sessionsCompleted: 0,
    totalFocusTime: 0,
    lastContributionAt: null,
    permissions: [],
  };
}

export function createOptimisticSquadInvite(
  squadId: string,
  invitedBy: string,
  invitedUserId: string,
  roleOffered: string
): SquadInvite {
  return {
    id: `temp-${Date.now()}`,
    squadId,
    invitedBy,
    invitedUserId,
    roleOffered: SquadRoleSchema.parse(roleOffered),
    message: null,
    status: 'PENDING',
    createdAt: Date.now(),
    expiresAt: Date.now() + 48 * 60 * 60 * 1000,
    respondedAt: null,
  };
}

function resolveLocalConflict(
  remoteState: Squad,
  conflict: { field: string; local: unknown; remote: unknown }
): Squad {
  switch (conflict.field) {
    case 'name':
      return typeof conflict.local === 'string' ? { ...remoteState, name: conflict.local } : remoteState;
    case 'description':
      return typeof conflict.local === 'string' || conflict.local === null
        ? { ...remoteState, description: conflict.local }
        : remoteState;
    case 'maxMembers':
      return typeof conflict.local === 'number' ? { ...remoteState, maxMembers: conflict.local } : remoteState;
    default:
      return remoteState;
  }
}
