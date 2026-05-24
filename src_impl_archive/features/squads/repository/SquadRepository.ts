/**
 * Squad Repository
 *
 * Data access layer for squad operations.
 *
 * @phase 4 - Deepening: Repository layer
 */

import { MMKV } from 'react-native-mmkv';
import { createDebugger } from '../../../utils/debug';
import type { SquadRole } from '../utils/validation';

const debug = createDebugger('squads:repository');

const storage = new MMKV({ id: 'squads-repo' });

const KEYS = {
  squad: (squadId: string) => `squad:${squadId}`,
  userSquad: (userId: string) => `user:squad:${userId}`,
  squadMembers: (squadId: string) => `squad:members:${squadId}`,
  squadInvites: (squadId: string) => `squad:invites:${squadId}`,
};

export interface Squad {
  id: string;
  name: string;
  description: string;
  founderId: string;
  createdAt: number;
  maxMembers: number;
  synergyLevel: number;
}

export interface SquadMember {
  userId: string;
  squadId: string;
  role: SquadRole;
  joinedAt: number;
  lastActive: number;
}

export class SquadRepository {
  async getSquad(squadId: string): Promise<Squad | null> {
    try {
      const data = storage.getString(KEYS.squad(squadId));
      return data ? JSON.parse(data) : null;
    } catch (error) {
      debug.error('Failed to get squad', error as Error);
      return null;
    }
  }

  async saveSquad(squad: Squad): Promise<void> {
    try {
      storage.set(KEYS.squad(squad.id), JSON.stringify(squad));
      debug.info('Squad saved', { squadId: squad.id });
    } catch (error) {
      debug.error('Failed to save squad', error as Error);
      throw new SquadRepositoryError('Failed to save squad', { cause: error });
    }
  }

  async getSquadMembers(squadId: string): Promise<SquadMember[]> {
    try {
      const data = storage.getString(KEYS.squadMembers(squadId));
      return data ? JSON.parse(data) : [];
    } catch (error) {
      debug.error('Failed to get squad members', error as Error);
      return [];
    }
  }

  async saveSquadMember(member: SquadMember): Promise<void> {
    try {
      const members = await this.getSquadMembers(member.squadId);
      const index = members.findIndex(m => m.userId === member.userId);

      if (index >= 0) {
        members[index] = member;
      } else {
        members.push(member);
      }

      storage.set(KEYS.squadMembers(member.squadId), JSON.stringify(members));
      debug.info('Squad member saved', { squadId: member.squadId, userId: member.userId });
    } catch (error) {
      debug.error('Failed to save squad member', error as Error);
      throw new SquadRepositoryError('Failed to save squad member', { cause: error });
    }
  }

  async removeSquadMember(squadId: string, userId: string): Promise<void> {
    try {
      const members = await this.getSquadMembers(squadId);
      const filtered = members.filter(m => m.userId !== userId);
      storage.set(KEYS.squadMembers(squadId), JSON.stringify(filtered));
      debug.info('Squad member removed', { squadId, userId });
    } catch (error) {
      debug.error('Failed to remove squad member', error as Error);
    }
  }

  async getUserSquad(userId: string): Promise<string | null> {
    return storage.getString(KEYS.userSquad(userId)) ?? null;
  }

  async setUserSquad(userId: string, squadId: string | null): Promise<void> {
    if (squadId) {
      storage.set(KEYS.userSquad(userId), squadId);
    } else {
      storage.delete(KEYS.userSquad(userId));
    }
  }

  async deleteSquad(squadId: string): Promise<void> {
    try {
      storage.delete(KEYS.squad(squadId));
      storage.delete(KEYS.squadMembers(squadId));
      debug.info('Squad deleted', { squadId });
    } catch (error) {
      debug.error('Failed to delete squad', error as Error);
    }
  }
}

export class SquadRepositoryError extends Error {
  constructor(message: string, public details?: { cause?: unknown }) {
    super(message);
    this.name = 'SquadRepositoryError';
  }
}

export const squadRepository = new SquadRepository();
export default squadRepository;
