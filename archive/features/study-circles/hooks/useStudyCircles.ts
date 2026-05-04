/**
 * useStudyCircles Hook
 *
 * React Query hook for Study Circles functionality.
 * Provides circle management, member contributions, and activity feeds.
 *
 * @phase 3
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { createDebugger } from '../../../utils/debug';
import { getStudyCirclesService } from '../service';
import type {
  CircleMemberDetail,
  ActivityFeed,
  CircleInvite,
  StudyCircle,
} from '../types';

const debug = createDebugger('study-circles:useStudyCircles');

// ============================================================================
// Query Keys
// ============================================================================

const studyCirclesKeys = {
  all: ['studyCircles'] as const,
  memberships: () => [...studyCirclesKeys.all, 'memberships'] as const,
  circle: (circleId: string) => [...studyCirclesKeys.all, 'circle', circleId] as const,
  members: (circleId: string) => [...studyCirclesKeys.all, 'members', circleId] as const,
  activityFeed: (circleId: string) => [...studyCirclesKeys.all, 'activityFeed', circleId] as const,
  invites: () => [...studyCirclesKeys.all, 'invites'] as const,
  public: () => [...studyCirclesKeys.all, 'public'] as const,
};

// ============================================================================
// Hook
// ============================================================================

export function useStudyCircles() {
  const queryClient = useQueryClient();
  const circlesService = getStudyCirclesService();

  // ============================================================================
  // Queries
  // ============================================================================

  const membershipsQuery = useQuery({
    queryKey: studyCirclesKeys.memberships(),
    queryFn: () => circlesService.getUserCircles(),
    refetchInterval: 60000, // 1 minute
  });

  const invitesQuery = useQuery({
    queryKey: studyCirclesKeys.invites(),
    queryFn: () => circlesService.getUserInvites(),
    refetchInterval: 30000, // 30 seconds
  });

  // ============================================================================
  // Mutations
  // ============================================================================

  const createCircleMutation = useMutation({
    mutationFn: (data: {
      name: string;
      description?: string;
      maxMembers?: number;
      weeklyGoalMinutes?: number;
      isPublic?: boolean;
    }) => circlesService.createCircle(data),
    onSuccess: (data) => {
      debug.info('Circle created successfully', data);
      queryClient.invalidateQueries({ queryKey: studyCirclesKeys.memberships() });
    },
  });

  const joinCircleMutation = useMutation({
    mutationFn: (circleId: string) => circlesService.joinCircle(circleId),
    onSuccess: (result) => {
      if (result.success) {
        debug.info('Circle joined successfully', result.circle);
        queryClient.invalidateQueries({ queryKey: studyCirclesKeys.memberships() });
        queryClient.invalidateQueries({ queryKey: studyCirclesKeys.invites() });
      }
    },
  });

  const leaveCircleMutation = useMutation({
    mutationFn: (circleId: string) => circlesService.leaveCircle(circleId),
    onSuccess: () => {
      debug.info('Circle left successfully');
      queryClient.invalidateQueries({ queryKey: studyCirclesKeys.memberships() });
    },
  });

  const respondToInviteMutation = useMutation({
    mutationFn: (params: { inviteId: string; accept: boolean }) =>
      circlesService.respondToInvite(params.inviteId, params.accept),
    onSuccess: (result, variables) => {
      debug.info('Invite response processed', { result, variables });
      queryClient.invalidateQueries({ queryKey: studyCirclesKeys.memberships() });
      queryClient.invalidateQueries({ queryKey: studyCirclesKeys.invites() });
    },
  });

  const updateContributionMutation = useMutation({
    mutationFn: (params: { circleId: string; durationMinutes: number; completed: boolean }) =>
      circlesService.updateMemberContribution(params.circleId, {
        durationMinutes: params.durationMinutes,
        completed: params.completed,
      }),
    onSuccess: () => {
      debug.info('Member contribution updated');
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: studyCirclesKeys.memberships() });
    },
  });

  // ============================================================================
  // Actions
  // ============================================================================

  const createCircle = useCallback((data: {
    name: string;
    description?: string;
    maxMembers?: number;
    weeklyGoalMinutes?: number;
    isPublic?: boolean;
  }) => {
    createCircleMutation.mutate(data);
  }, [createCircleMutation]);

  const joinCircle = useCallback((circleId: string) => {
    joinCircleMutation.mutate(circleId);
  }, [joinCircleMutation]);

  const leaveCircle = useCallback((circleId: string) => {
    leaveCircleMutation.mutate(circleId);
  }, [leaveCircleMutation]);

  const respondToInvite = useCallback((inviteId: string, accept: boolean) => {
    respondToInviteMutation.mutate({ inviteId, accept });
  }, [respondToInviteMutation]);

  const updateContribution = useCallback((
    circleId: string,
    durationMinutes: number,
    completed: boolean
  ) => {
    updateContributionMutation.mutate({ circleId, durationMinutes, completed });
  }, [updateContributionMutation]);

  // ============================================================================
  // Derived State
  // ============================================================================

  const hasCircles = (membershipsQuery.data?.length || 0) > 0;
  const hasPendingInvites = (invitesQuery.data?.length || 0) > 0;
  const isCreating = createCircleMutation.isPending;
  const isJoining = joinCircleMutation.isPending;
  const isLeaving = leaveCircleMutation.isPending;

  // ============================================================================
  // Error Handling
  // ============================================================================

  const error = membershipsQuery.error || invitesQuery.error || null;

  // ============================================================================
  // Return
  // ============================================================================

  return {
    // Data
    memberships: membershipsQuery.data || [],
    invites: invitesQuery.data || [],

    // State
    hasCircles,
    hasPendingInvites,
    isCreating,
    isJoining,
    isLeaving,

    // Loading states
    isLoading: membershipsQuery.isLoading || invitesQuery.isLoading,
    isFetching: membershipsQuery.isFetching || invitesQuery.isFetching,

    // Error states
    error,
    isError: !!error,

    // Actions
    createCircle,
    joinCircle,
    leaveCircle,
    respondToInvite,
    updateContribution,

    // Raw queries for advanced use
    queries: {
      memberships: membershipsQuery,
      invites: invitesQuery,
    },
  };
}

// ============================================================================
// Helper Hook: Circle by ID
// ============================================================================

export function useCircle(circleId: string) {
  const circlesService = getStudyCirclesService();
  
  const circleQuery = useQuery({
    queryKey: studyCirclesKeys.circle(circleId),
    queryFn: () => circlesService.getCircle(circleId),
    enabled: !!circleId,
  });

  const membersQuery = useQuery({
    queryKey: studyCirclesKeys.members(circleId),
    queryFn: () => circlesService.getCircleMembers(circleId),
    enabled: !!circleId,
  });

  const activityFeedQuery = useQuery({
    queryKey: studyCirclesKeys.activityFeed(circleId),
    queryFn: () => circlesService.getActivityFeed(circleId),
    enabled: !!circleId,
  });

  return {
    circle: circleQuery.data,
    members: membersQuery.data || [],
    activityFeed: activityFeedQuery.data,
    isLoading: circleQuery.isLoading || membersQuery.isLoading || activityFeedQuery.isLoading,
    error: circleQuery.error || membersQuery.error || activityFeed.error,
    refetch: () => {
      circleQuery.refetch();
      membersQuery.refetch();
      activityFeedQuery.refetch();
    },
  };
}

// ============================================================================
// Helper Hook: Circle Management
// ============================================================================

export function useCircleManagement(circleId: string) {
  const { circle, members, activityFeed, isLoading, error, refetch } = useCircle(circleId);
  const queryClient = useQueryClient();
  const circlesService = getStudyCirclesService();

  const updateSettingsMutation = useMutation({
    mutationFn: (settings: {
      name?: string;
      description?: string;
      weeklyGoalMinutes?: number;
      isPublic?: boolean;
    }) => circlesService.updateCircleSettings(circleId, settings),
    onSuccess: () => {
      debug.info('Circle settings updated', { circleId });
      queryClient.invalidateQueries({ queryKey: studyCirclesKeys.circle(circleId) });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (memberUserId: string) => circlesService.removeMember(circleId, memberUserId),
    onSuccess: () => {
      debug.info('Member removed from circle', { circleId });
      queryClient.invalidateQueries({ queryKey: studyCirclesKeys.circle(circleId) });
    },
  });

  const addActivityMutation = useMutation({
    mutationFn: (data: { type: string; data: Record<string, unknown> }) =>
      circlesService.addActivity(circleId, data.type, data.data),
    onSuccess: () => {
      debug.info('Activity added to circle', { circleId });
      queryClient.invalidateQueries({ queryKey: studyCirclesKeys.activityFeed(circleId) });
    },
  });

  const updateSettings = useCallback((settings: {
    name?: string;
    description?: string;
    weeklyGoalMinutes?: number;
    isPublic?: boolean;
  }) => {
    updateSettingsMutation.mutate(settings);
  }, [updateSettingsMutation]);

  const removeMember = useCallback((memberUserId: string) => {
    removeMemberMutation.mutate(memberUserId);
  }, [removeMemberMutation]);

  const addActivity = useCallback((type: string, data: Record<string, unknown>) => {
    addActivityMutation.mutate({ type, data });
  }, [addActivityMutation]);

  const isManaging = updateSettingsMutation.isPending || removeMemberMutation.isPending;
  const managementError = updateSettingsMutation.error || removeMemberMutation.error;

  return {
    circle,
    members,
    activityFeed,
    isLoading: isLoading || isManaging,
    error: error || managementError,
    refetch,
    updateSettings,
    removeMember,
    addActivity,
    isUpdatingSettings: updateSettingsMutation.isPending,
    isRemovingMember: removeMemberMutation.isPending,
  };
}
