/**
 * useStudyBuddies Hook
 *
 * React Query hook for Study Buddies functionality.
 * Provides buddy management, encouragements, and check-ins.
 *
 * @phase 3
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { createDebugger } from '../../../utils/debug';
import { getStudyBuddiesService } from '../service';
import type {
  StudyBuddy,
  SharedGoal,
  BuddyEncouragement,
  BuddyCheckIn,
  BuddyMatch,
} from '../types';

const debug = createDebugger('study-buddies:useStudyBuddies');

// ============================================================================
// Query Keys
// ============================================================================

const studyBuddiesKeys = {
  all: ['studyBuddies'] as const,
  buddies: () => [...studyBuddiesKeys.all, 'buddies'] as const,
  sharedGoals: () => [...studyBuddiesKeys.all, 'sharedGoals'] as const,
  matches: () => [...studyBuddiesKeys.all, 'matches'] as const,
  encouragements: (buddyPairId: string) => [...studyBuddiesKeys.all, 'encouragements', buddyPairId] as const,
  checkIns: (buddyPairId: string) => [...studyBuddiesKeys.all, 'checkIns', buddyPairId] as const,
};

// ============================================================================
// Hook
// ============================================================================

export function useStudyBuddies() {
  const queryClient = useQueryClient();
  const buddiesService = getStudyBuddiesService();

  // ============================================================================
  // Queries
  // ============================================================================

  const buddiesQuery = useQuery({
    queryKey: studyBuddiesKeys.buddies(),
    queryFn: () => buddiesService.getUserBuddies(),
    refetchInterval: 60000, // 1 minute
  });

  const sharedGoalsQuery = useQuery({
    queryKey: studyBuddiesKeys.sharedGoals(),
    queryFn: () => buddiesService.getSharedGoals(),
    refetchInterval: 300000, // 5 minutes
  });

  const matchesQuery = useQuery({
    queryKey: studyBuddiesKeys.matches(),
    queryFn: () => buddiesService.findBuddyMatches(),
    refetchInterval: 600000, // 10 minutes
  });

  // ============================================================================
  // Mutations
  // ============================================================================

  const createRequestMutation = useMutation({
    mutationFn: (params: { buddyId: string; sharedGoalId?: string }) =>
      buddiesService.createBuddyRequest(params.buddyId, params.sharedGoalId),
    onSuccess: (result) => {
      if (result.success) {
        debug.info('Buddy request created successfully', result.buddy);
        queryClient.invalidateQueries({ queryKey: studyBuddiesKeys.buddies() });
      }
    },
  });

  const acceptRequestMutation = useMutation({
    mutationFn: (buddyPairId: string) => buddiesService.acceptBuddyRequest(buddyPairId),
    onSuccess: () => {
      debug.info('Buddy request accepted successfully');
      queryClient.invalidateQueries({ queryKey: studyBuddiesKeys.buddies() });
    },
  });

  const declineRequestMutation = useMutation({
    mutationFn: (buddyPairId: string) => buddiesService.declineBuddyRequest(buddyPairId),
    onSuccess: () => {
      debug.info('Buddy request declined successfully');
      queryClient.invalidateQueries({ queryKey: studyBuddiesKeys.buddies() });
    },
  });

  const endRelationshipMutation = useMutation({
    mutationFn: (params: { buddyPairId: string; reason: string }) =>
      buddiesService.endBuddyRelationship(params.buddyPairId, params.reason),
    onSuccess: () => {
      debug.info('Buddy relationship ended successfully');
      queryClient.invalidateQueries({ queryKey: studyBuddiesKeys.buddies() });
    },
  });

  const sendEncouragementMutation = useMutation({
    mutationFn: (params: { 
      buddyPairId: string; 
      toUserId: string; 
      type: string; 
      message?: string; 
    }) => buddiesService.sendEncouragement(
      params.buddyPairId,
      params.toUserId,
      params.type,
      params.message
    ),
    onSuccess: () => {
      debug.info('Encouragement sent successfully');
      queryClient.invalidateQueries({ queryKey: studyBuddiesKeys.buddies() });
    },
  });

  const submitCheckInMutation = useMutation({
    mutationFn: (params: {
      buddyPairId: string;
      checkInData: {
        completedSession: boolean;
        minutesStudied: number;
        mood: string;
        note?: string;
      };
    }) => buddiesService.submitCheckIn(params.buddyPairId, params.checkInData),
    onSuccess: () => {
      debug.info('Check-in submitted successfully');
      queryClient.invalidateQueries({ queryKey: studyBuddiesKeys.buddies() });
    },
  });

  // ============================================================================
  // Actions
  // ============================================================================

  const createBuddyRequest = useCallback((buddyId: string, sharedGoalId?: string) => {
    createRequestMutation.mutate({ buddyId, sharedGoalId });
  }, [createRequestMutation]);

  const acceptBuddyRequest = useCallback((buddyPairId: string) => {
    acceptRequestMutation.mutate(buddyPairId);
  }, [acceptRequestMutation]);

  const declineBuddyRequest = useCallback((buddyPairId: string) => {
    declineRequestMutation.mutate(buddyPairId);
  }, [declineRequestMutation]);

  const endBuddyRelationship = useCallback((buddyPairId: string, reason: string) => {
    endRelationshipMutation.mutate({ buddyPairId, reason });
  }, [endRelationshipMutation]);

  const sendEncouragement = useCallback((
    buddyPairId: string,
    toUserId: string,
    type: string,
    message?: string
  ) => {
    sendEncouragementMutation.mutate({ buddyPairId, toUserId, type, message });
  }, [sendEncouragementMutation]);

  const submitCheckIn = useCallback((
    buddyPairId: string,
    checkInData: {
      completedSession: boolean;
      minutesStudied: number;
      mood: string;
      note?: string;
    }
  ) => {
    submitCheckInMutation.mutate({ buddyPairId, checkInData });
  }, [submitCheckInMutation]);

  // ============================================================================
  // Derived State
  // ============================================================================

  const hasBuddies = (buddiesQuery.data?.length || 0) > 0;
  const hasActiveBuddy = (buddiesQuery.data?.find(b => b.status === 'ACTIVE')) !== undefined;
  const hasPendingRequests = (buddiesQuery.data?.filter(b => b.status === 'PENDING').length || 0) > 0;
  const availableMatches = matchesQuery.data || [];

  // ============================================================================
  // Error Handling
  // ============================================================================

  const error = buddiesQuery.error || sharedGoalsQuery.error || matchesQuery.error || null;

  // ============================================================================
  // Return
  // ============================================================================

  return {
    // Data
    buddies: buddiesQuery.data || [],
    sharedGoals: sharedGoalsQuery.data || [],
    matches: availableMatches,

    // State
    hasBuddies,
    hasActiveBuddy,
    hasPendingRequests,
    availableMatchesCount: availableMatches.length,

    // Loading states
    isLoading: buddiesQuery.isLoading || sharedGoalsQuery.isLoading || matchesQuery.isLoading,
    isFetching: buddiesQuery.isFetching || sharedGoalsQuery.isFetching || matchesQuery.isFetching,
    isCreatingRequest: createRequestMutation.isPending,
    isAcceptingRequest: acceptRequestMutation.isPending,
    isDecliningRequest: declineRequestMutation.isPending,
    isEndingRelationship: endRelationshipMutation.isPending,
    isSendingEncouragement: sendEncouragementMutation.isPending,
    isSubmittingCheckIn: submitCheckInMutation.isPending,

    // Error states
    error,
    isError: !!error,

    // Actions
    createBuddyRequest,
    acceptBuddyRequest,
    declineBuddyRequest,
    endBuddyRelationship,
    sendEncouragement,
    submitCheckIn,

    // Raw queries for advanced use
    queries: {
      buddies: buddiesQuery,
      sharedGoals: sharedGoalsQuery,
      matches: matchesQuery,
    },
  };
}

// ============================================================================
// Helper Hook: Buddy by ID
// ============================================================================

export function useBuddy(buddyPairId: string) {
  const buddiesService = getStudyBuddiesService();
  
  const encouragementsQuery = useQuery({
    queryKey: studyBuddiesKeys.encouragements(buddyPairId),
    queryFn: () => buddiesService.getEncouragements(buddyPairId),
    enabled: !!buddyPairId,
  });

  const checkInsQuery = useQuery({
    queryKey: studyBuddiesKeys.checkIns(buddyPairId),
    queryFn: () => buddiesService.getCheckIns(buddyPairId),
    enabled: !!buddyPairId,
  });

  const statsQuery = useQuery({
    queryKey: [...studyBuddiesKeys.all, 'stats', buddyPairId],
    queryFn: () => buddiesService.getBuddyStats(buddyPairId),
    enabled: !!buddyPairId,
  });

  return {
    encouragements: encouragementsQuery.data || [],
    checkIns: checkInsQuery.data || [],
    stats: statsQuery.data,
    isLoading: encouragementsQuery.isLoading || checkInsQuery.isLoading || statsQuery.isLoading,
    error: encouragementsQuery.error || checkInsQuery.error || statsQuery.error,
    refetch: () => {
      encouragementsQuery.refetch();
      checkInsQuery.refetch();
      statsQuery.refetch();
    },
  };
}

// ============================================================================
// Helper Hook: Encouragement Suggestions
// ============================================================================

export function useEncouragementSuggestions(buddyPairId: string) {
  const buddiesService = getStudyBuddiesService();
  
  const suggestionsQuery = useQuery({
    queryKey: [...studyBuddiesKeys.all, 'suggestions', buddyPairId],
    queryFn: () => buddiesService.getEncouragementSuggestions(buddyPairId),
    enabled: !!buddyPairId,
    refetchInterval: 300000, // 5 minutes
  });

  return {
    suggestions: suggestionsQuery.data || [],
    isLoading: suggestionsQuery.isLoading,
    error: suggestionsQuery.error,
    refetch: suggestionsQuery.refetch,
  };
}
