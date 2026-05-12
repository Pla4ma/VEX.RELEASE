/**
 * Squads Hooks
 *
 * TanStack Query hooks for squad data fetching and mutations.
 */

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import * as service from './service';
import * as repository from './repository';
import { createDebugger } from '../../utils/debug';
import { type Squad, type SquadSummary, type SquadMemberDetail, type SquadInviteDetail, type CreateSquadInput, type UpdateSquadInput, type InviteToSquadInput, type RespondToInviteInput, type LeaveSquadInput, type KickMemberInput, type UpdateMemberRoleInput, type StartSquadSessionInput } from './schemas';

const SQUAD_QUERY_KEYS = {
  all: ['squads'] as const,
  lists: () => [...SQUAD_QUERY_KEYS.all, 'list'] as const,
  list: (filters: { userId: string }) => [...SQUAD_QUERY_KEYS.lists(), filters] as const,
  details: () => [...SQUAD_QUERY_KEYS.all, 'detail'] as const,
  detail: (squadId: string) => [...SQUAD_QUERY_KEYS.details(), squadId] as const,
  members: (squadId: string) => [...SQUAD_QUERY_KEYS.detail(squadId), 'members'] as const,
  invites: (userId: string) => [...SQUAD_QUERY_KEYS.all, 'invites', userId] as const,
  public: () => [...SQUAD_QUERY_KEYS.all, 'public'] as const,
};
const debug = createDebugger('squads:hooks');

// ============================================================================
// Query Hooks
// ============================================================================

export function useUserSquads(userId: string | undefined, options?: Omit<UseQueryOptions<SquadSummary[], Error, SquadSummary[], ReturnType<typeof SQUAD_QUERY_KEYS.list>>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: SQUAD_QUERY_KEYS.list({ userId: userId || '' }),
    queryFn: () => service.getUserSquads(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useSquad(squadId: string | undefined, options?: UseQueryOptions<Squad | null>) {
  return useQuery({
    queryKey: SQUAD_QUERY_KEYS.detail(squadId || ''),
    queryFn: () => service.getSquadById(squadId!),
    enabled: !!squadId,
    staleTime: 2 * 60 * 1000,
    ...options,
  });
}

export function useSquadMembers(squadId: string | undefined, options?: UseQueryOptions<SquadMemberDetail[]>) {
  return useQuery({
    queryKey: SQUAD_QUERY_KEYS.members(squadId || ''),
    queryFn: () => service.getSquadMembers(squadId!),
    enabled: !!squadId,
    staleTime: 1 * 60 * 1000,
    ...options,
  });
}

export function useSquadInvites(userId: string | undefined, options?: UseQueryOptions<SquadInviteDetail[]>) {
  return useQuery({
    queryKey: SQUAD_QUERY_KEYS.invites(userId || ''),
    queryFn: () => service.getSquadInvitesForUser(userId!),
    enabled: !!userId,
    staleTime: 1 * 60 * 1000,
    ...options,
  });
}

export function usePublicSquads(options?: { limit?: number; offset?: number; search?: string }) {
  return useQuery({
    queryKey: SQUAD_QUERY_KEYS.public(),
    queryFn: () => service.getPublicSquads(options),
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

export function useCreateSquad(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSquadInput) => service.createSquad(userId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SQUAD_QUERY_KEYS.lists() });
    },
  });
}

export function useUpdateSquad(squadId: string, userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateSquadInput) => service.updateSquad(squadId, userId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SQUAD_QUERY_KEYS.detail(squadId) });
    },
  });
}

export function useDeleteSquad(squadId: string, userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => service.deleteSquad(squadId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SQUAD_QUERY_KEYS.lists() });
      queryClient.removeQueries({ queryKey: SQUAD_QUERY_KEYS.detail(squadId) });
    },
  });
}

export function useInviteToSquad(invitedBy: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<InviteToSquadInput, 'squadId'> & { squadId: string }) => service.inviteToSquad({ ...input, invitedBy }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: SQUAD_QUERY_KEYS.detail(variables.squadId) });
    },
  });
}

export function useRespondToInvite(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RespondToInviteInput) => service.respondToInvite(userId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SQUAD_QUERY_KEYS.invites(userId) });
      queryClient.invalidateQueries({ queryKey: SQUAD_QUERY_KEYS.lists() });
    },
  });
}

export function useLeaveSquad(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LeaveSquadInput) => service.leaveSquad(userId, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: SQUAD_QUERY_KEYS.lists() });
      queryClient.removeQueries({ queryKey: SQUAD_QUERY_KEYS.detail(variables.squadId) });
    },
  });
}

export function useKickMember(adminUserId: string, squadId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<KickMemberInput, 'squadId'>) => service.kickMember(adminUserId, { ...input, squadId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SQUAD_QUERY_KEYS.members(squadId) });
      queryClient.invalidateQueries({ queryKey: SQUAD_QUERY_KEYS.detail(squadId) });
    },
  });
}

export function useUpdateMemberRole(adminUserId: string, squadId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<UpdateMemberRoleInput, 'squadId'>) => service.updateMemberRole(adminUserId, { ...input, squadId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SQUAD_QUERY_KEYS.members(squadId) });
    },
  });
}

export function useJoinSquadWithCode(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (joinCode: string) => service.joinSquadWithCode(userId, joinCode),
    onSuccess: (squad) => {
      queryClient.invalidateQueries({ queryKey: SQUAD_QUERY_KEYS.lists() });
      queryClient.setQueryData(SQUAD_QUERY_KEYS.detail(squad.id), squad);
    },
  });
}

export function useRequestToJoinSquad(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { squadId: string; message?: string }) => service.requestToJoinSquad(userId, input.squadId, input.message),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: SQUAD_QUERY_KEYS.detail(variables.squadId) });
    },
  });
}

export function useStartSquadSession(userId: string, squadId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<StartSquadSessionInput, 'squadId'>) => service.startSquadSession(userId, { ...input, squadId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SQUAD_QUERY_KEYS.detail(squadId) });
    },
  });
}

// ============================================================================
// Permission Hook
// ============================================================================

export function useSquadPermissions(squadId: string | undefined, userId: string | undefined) {
  const { data: member } = useQuery({
    queryKey: [...SQUAD_QUERY_KEYS.detail(squadId || ''), 'member', userId || ''],
    queryFn: () => service.getSquadMember(squadId!, userId!),
    enabled: !!squadId && !!userId,
    staleTime: 2 * 60 * 1000,
  });

  return {
    role: member?.role || null,
    permissions: member ? service.getRolePermissions(member.role) : [],
    hasPermission: (permission: import('./schemas').SquadPermission) => (member ? service.hasPermission(member, permission) : false),
    isLoading: !squadId || !userId,
  };
}

// ============================================================================
// Squad Members Focusing Hook (Real-time)
// ============================================================================

export function useSquadMembersFocusing(userId: string | undefined) {
  const [count, setCount] = useState(0);
  const { data: userSquads } = useUserSquads(userId);
  const squadId = userSquads?.[0]?.id;

  useEffect(() => {
    let isCancelled = false;

    if (!squadId || !userId) {
      setCount(0);
      return () => {
        isCancelled = true;
      };
    }

    const fetchActiveCount = async () => {
      try {
        const { data, error } = await repository.getActiveSquadSessionCount(squadId, userId);
        if (!isCancelled && !error && typeof data === 'number') {
          setCount(data);
        }
      } catch (error) {
        debug.error('Failed to fetch squad active count', error instanceof Error ? error : new Error(String(error)));
        if (!isCancelled) {
          setCount(0);
        }
      }
    };

    void fetchActiveCount();

    const channel = repository.subscribeToSquadSessions(
      squadId,
      (activeCount) => {
        if (!isCancelled) {
          setCount(activeCount);
        }
      },
      userId,
    );

    return () => {
      isCancelled = true;
      if (channel && typeof channel.unsubscribe === 'function') {
        void channel.unsubscribe();
      }
    };
  }, [squadId, userId]);

  return count;
}

// ============================================================================
// Squad War Live Hook
// ============================================================================

// Stats Hooks
// ============================================================================

export function useSquadStats(squadId: string | undefined) {
  return useQuery({
    queryKey: ['squad-stats', squadId],
    queryFn: () =>
      Promise.resolve({
        totalFocusTime: 0,
        memberCount: 0,
        weeklyAverage: 0,
      }),
    enabled: !!squadId,
  });
}

export function useSquadMissions(squadId: string | undefined) {
  return useQuery({
    queryKey: ['squad-missions', squadId],
    queryFn: () => Promise.resolve([]),
    enabled: !!squadId,
  });
}


