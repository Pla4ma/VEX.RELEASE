/**
 * Squads Service Queries
 * Read-only query functions
 */

import * as repository from '../repository';
import type {
  Squad,
  SquadSummary,
  SquadMember,
  SquadMemberDetail,
  SquadInvite,
  SquadInviteDetail,
  SquadJoinRequest,
  SquadSynergy,
  SquadActivity,
  SquadStats,
} from '../schemas';

export async function getSquadById(squadId: string): Promise<Squad | null> {
  return repository.fetchSquadById(squadId);
}

export async function getSquadSummary(squadId: string): Promise<SquadSummary | null> {
  return repository.fetchSquadSummary(squadId);
}

export async function getSquadMembers(squadId: string): Promise<SquadMember[]> {
  return repository.fetchSquadMembers(squadId);
}

export async function getSquadMember(squadId: string, userId: string): Promise<SquadMember | null> {
  return repository.fetchSquadMember(squadId, userId);
}

export async function getSquadMemberDetails(squadId: string): Promise<SquadMemberDetail[]> {
  return repository.fetchSquadMemberDetails(squadId);
}

export async function getUserInvites(userId: string): Promise<SquadInvite[]> {
  return repository.fetchUserInvites(userId);
}

export async function getUserJoinRequests(userId: string): Promise<SquadJoinRequest[]> {
  return repository.fetchUserJoinRequests(userId);
}

export async function getSquadInvites(squadId: string): Promise<SquadInviteDetail[]> {
  return repository.fetchSquadInvites(squadId);
}

export async function getSquadJoinRequests(squadId: string): Promise<SquadJoinRequest[]> {
  return repository.fetchSquadJoinRequests(squadId);
}

export async function getSquadSynergy(squadId: string): Promise<SquadSynergy | null> {
  return repository.fetchSquadSynergy(squadId);
}

export async function getSquadActivity(squadId: string, limit = 50): Promise<SquadActivity[]> {
  return repository.fetchSquadActivity(squadId, limit);
}

export async function getSquadStats(squadId: string): Promise<SquadStats | null> {
  return repository.fetchSquadStats(squadId);
}

export async function searchSquads(query: string, filters?: { tags?: string[]; isPublic?: boolean }): Promise<SquadSummary[]> {
  return repository.searchSquads(query, filters);
}

export async function getUserSquads(userId: string): Promise<SquadSummary[]> {
  return repository.fetchUserSquads(userId);
}

export async function getRecommendedSquads(userId: string): Promise<SquadSummary[]> {
  return repository.fetchRecommendedSquads(userId);
}
