/**
 * Basic Squads Hooks
 *
 * React hooks for the simplified squads accountability system.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store';
import * as service from '../squads/basic-squads-service';
import type { Squad, SquadInvite } from '../squads/schemas';

// ============================================================================
// Query Keys
// ============================================================================

export const squadsKeys = {
  all: ['squads'] as const,
  status: (userId: string) => ['squads', 'status', userId] as const,
  contributions: (squadId: string) => ['squads', 'contributions', squadId] as const,
};

// ============================================================================
// Basic Squads Status Hook
// ============================================================================

export function useBasicSquadsStatus() {
  const userId = useAuthStore((state) => state.user?.id ?? null);

  return useQuery({
    queryKey: squadsKeys.status(userId ?? 'no-user'),
    queryFn: () => {
      if (!userId) throw new Error('User not authenticated');
      return service.getBasicSquadStatus(userId);
    },
    enabled: !!userId,
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ============================================================================
// Squad Contributions Hook
// ============================================================================

export function useBasicSquadContributions(squadId: string) {
  return useQuery({
    queryKey: squadsKeys.contributions(squadId),
    queryFn: () => {
      return service.getBasicSquadMemberContributions(squadId);
    },
    staleTime: 60000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// ============================================================================
// Create Squad Hook
// ============================================================================

export function useCreateBasicSquad() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id ?? null);

  return useMutation({
    mutationFn: ({
      name,
      description,
      weeklyGoalMinutes,
    }: {
      name: string;
      description?: string;
      weeklyGoalMinutes?: number;
    }) => {
      if (!userId) throw new Error('User not authenticated');
      return service.createBasicSquad(userId, { name, description, weeklyGoalMinutes });
    },
    onSuccess: (result, variables) => {
      // Invalidate squad status query
      if (userId) {
        queryClient.invalidateQueries({ queryKey: squadsKeys.status(userId) });
      }
    },
    onError: (error) => {
      console.error('Failed to create squad:', error);
    },
  });
}

// ============================================================================
// Invite to Squad Hook
// ============================================================================

export function useInviteToBasicSquad() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id ?? null);

  return useMutation({
    mutationFn: ({
      squadId,
      inviteeId,
      message,
    }: {
      squadId: string;
      inviteeId: string;
      message?: string;
    }) => {
      if (!userId) throw new Error('User not authenticated');
      return service.inviteToBasicSquad(squadId, userId, inviteeId, message);
    },
    onSuccess: (result, variables) => {
      // Invalidate squad status query
      if (userId) {
        queryClient.invalidateQueries({ queryKey: squadsKeys.status(userId) });
      }
    },
    onError: (error) => {
      console.error('Failed to send squad invite:', error);
    },
  });
}

// ============================================================================
// Respond to Invite Hook
// ============================================================================

export function useRespondToBasicSquadInvite() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id ?? null);

  return useMutation({
    mutationFn: ({
      inviteId,
      accept,
    }: {
      inviteId: string;
      accept: boolean;
    }) => {
      if (!userId) throw new Error('User not authenticated');
      return service.respondToBasicSquadInvite(inviteId, userId, accept);
    },
    onSuccess: (result, variables) => {
      // Invalidate squad status query if user joined
      if (result.success && result.squad && userId) {
        queryClient.invalidateQueries({ queryKey: squadsKeys.status(userId) });
        queryClient.invalidateQueries({ queryKey: squadsKeys.contributions(result.squad.id) });
      }
    },
    onError: (error) => {
      console.error('Failed to respond to squad invite:', error);
    },
  });
}

// ============================================================================
// Update Weekly Progress Hook
// ============================================================================

export function useUpdateBasicSquadWeeklyProgress() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id ?? null);

  return useMutation({
    mutationFn: ({
      squadId,
      sessionMinutes,
    }: {
      squadId: string;
      sessionMinutes: number;
    }) => {
      if (!userId) throw new Error('User not authenticated');
      return service.updateBasicSquadWeeklyProgress(squadId, userId, sessionMinutes);
    },
    onSuccess: (result, variables) => {
      // Invalidate squad contributions query
      queryClient.invalidateQueries({ queryKey: squadsKeys.contributions(variables.squadId) });

      // Invalidate squad status query if goal was completed
      if (result.goalCompleted && userId) {
        queryClient.invalidateQueries({ queryKey: squadsKeys.status(userId) });
      }
    },
    onError: (error) => {
      console.error('Failed to update squad weekly progress:', error);
    },
  });
}

// ============================================================================
// Send Squad Notification Hook
// ============================================================================

export function useSendBasicSquadNotification() {
  return useMutation({
    mutationFn: ({
      squadId,
      type,
      data,
    }: {
      squadId: string;
      type: "WEEKLY_GOAL_PROGRESS" | "WEEKLY_GOAL_COMPLETED" | "MEMBER_ACTIVITY";
      data: {
        message: string;
        userId?: string;
        progress?: number;
        goal?: number;
      };
    }) => {
      return service.sendBasicSquadNotification(squadId, type, data);
    },
    onError: (error) => {
      console.error('Failed to send squad notification:', error);
    },
  });
}

// ============================================================================
// Combined Squads Hook for Home Screen
// ============================================================================

export function useBasicSquads() {
  const statusQuery = useBasicSquadsStatus();
  const contributionsQuery = useBasicSquadContributions(statusQuery.data?.squad?.id ?? '');
  const createMutation = useCreateBasicSquad();
  const inviteMutation = useInviteToBasicSquad();
  const respondMutation = useRespondToBasicSquadInvite();
  const progressMutation = useUpdateBasicSquadWeeklyProgress();
  const notificationMutation = useSendBasicSquadNotification();

  const isLoading = statusQuery.isLoading || contributionsQuery.isLoading;
  const error = statusQuery.error || contributionsQuery.error;
  const status = statusQuery.data;
  const contributions = contributionsQuery.data;

  const hasSquad = status?.hasSquad ?? false;
  const squad = status?.squad;
  const isFounder = status?.isFounder ?? false;
  const isAdmin = status?.isAdmin ?? false;
  const memberCount = status?.memberCount ?? 0;
  const weeklyProgress = status?.weeklyProgress;

  return {
    status,
    contributions,
    isLoading,
    error,
    hasSquad,
    squad,
    isFounder,
    isAdmin,
    memberCount,
    weeklyProgress,
    createSquad: createMutation.mutate,
    isCreatingSquad: createMutation.isPending,
    inviteToSquad: inviteMutation.mutate,
    isInviting: inviteMutation.isPending,
    respondToInvite: respondMutation.mutate,
    isResponding: respondMutation.isPending,
    updateProgress: progressMutation.mutate,
    isUpdatingProgress: progressMutation.isPending,
    sendNotification: notificationMutation.mutate,
    isSendingNotification: notificationMutation.isPending,
  };
}
