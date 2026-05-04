/**
 * useSeasonJourney Hook
 *
 * React Query hook for Season Journey progression.
 * Provides journey progress, milestone claiming, and XP tracking.
 *
 * @phase 3
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { createDebugger } from '../../../utils/debug';
import { getSeasonJourneyService } from '../service';
import { getProgressionService } from '../progression';
import type {
  UserJourneySummary,
  JourneyMilestone,
  SeasonSummary,
} from '../types';

const debug = createDebugger('season-journey:useSeasonJourney');

// ============================================================================
// Query Keys
// ============================================================================

const seasonJourneyKeys = {
  all: ['seasonJourney'] as const,
  summary: () => [...seasonJourneyKeys.all, 'summary'] as const,
  milestones: (seasonId: string) => [...seasonJourneyKeys.all, 'milestones', seasonId] as const,
  userJourney: (seasonId: string) => [...seasonJourneyKeys.all, 'user', seasonId] as const,
  unclaimed: (seasonId: string) => [...seasonJourneyKeys.all, 'unclaimed', seasonId] as const,
};

// ============================================================================
// Hook
// ============================================================================

export function useSeasonJourney() {
  const queryClient = useQueryClient();
  const journeyService = getSeasonJourneyService();
  const progressionService = getProgressionService();

  // ============================================================================
  // Queries
  // ============================================================================

  const summaryQuery = useQuery({
    queryKey: seasonJourneyKeys.summary(),
    queryFn: () => journeyService.getSeasonSummary(),
    refetchInterval: 60000, // 1 minute
  });

  const milestonesQuery = useQuery({
    queryKey: seasonJourneyKeys.milestones(summaryQuery.data?.activeSeason?.seasonId || ''),
    queryFn: () => journeyService.getCurrentSeasonMilestones(),
    enabled: !!summaryQuery.data?.activeSeason,
  });

  const userJourneyQuery = useQuery({
    queryKey: seasonJourneyKeys.userJourney(summaryQuery.data?.activeSeason?.seasonId || ''),
    queryFn: () => journeyService.getJourneySummary(),
    enabled: !!summaryQuery.data?.activeSeason,
  });

  const unclaimedQuery = useQuery({
    queryKey: seasonJourneyKeys.unclaimed(summaryQuery.data?.activeSeason?.seasonId || ''),
    queryFn: () => journeyService.getUnclaimedMilestones(),
    enabled: !!summaryQuery.data?.activeSeason,
  });

  // ============================================================================
  // Mutations
  // ============================================================================

  const initializeMutation = useMutation({
    mutationFn: () => journeyService.initializeJourney(),
    onSuccess: (data) => {
      debug.info('Journey initialized', data);
      queryClient.invalidateQueries({ queryKey: seasonJourneyKeys.summary() });
      queryClient.invalidateQueries({ queryKey: seasonJourneyKeys.userJourney(summaryQuery.data?.activeSeason?.seasonId || '') });
    },
  });

  const claimMutation = useMutation({
    mutationFn: (milestoneNumber: number) => 
      journeyService.claimMilestone(milestoneNumber),
    onSuccess: (result, milestoneNumber) => {
      debug.info('Milestone claimed', { milestoneNumber, result });
      queryClient.invalidateQueries({ queryKey: seasonJourneyKeys.userJourney(summaryQuery.data?.activeSeason?.seasonId || '') });
      queryClient.invalidateQueries({ queryKey: seasonJourneyKeys.unclaimed(summaryQuery.data?.activeSeason?.seasonId || '') });
      
      // Also invalidate progression to update XP
      queryClient.invalidateQueries({ queryKey: ['progression'] });
    },
  });

  const addXpMutation = useMutation({
    mutationFn: (params: { amount: number; source?: string }) =>
      journeyService.addXp(params.amount, params.source),
    onSuccess: (result) => {
      debug.info('Journey XP added', result);
      queryClient.invalidateQueries({ queryKey: seasonJourneyKeys.userJourney(summaryQuery.data?.activeSeason?.seasonId || '') });
      
      // Also invalidate progression
      queryClient.invalidateQueries({ queryKey: ['progression'] });
    },
  });

  // ============================================================================
  // Actions
  // ============================================================================

  const initializeJourney = useCallback(() => {
    initializeMutation.mutate();
  }, [initializeMutation]);

  const claimMilestone = useCallback((milestoneNumber: number) => {
    claimMutation.mutate(milestoneNumber);
  }, [claimMutation]);

  const addJourneyXp = useCallback((amount: number, source?: string) => {
    addXpMutation.mutate({ amount, source });
  }, [addXpMutation]);

  const canClaimMilestone = useCallback((milestoneNumber: number): boolean => {
    if (!userJourneyQuery.data) return false;
    return userJourneyQuery.data.currentMilestone >= milestoneNumber && 
           !userJourneyQuery.data.claimedMilestones.includes(milestoneNumber);
  }, [userJourneyQuery.data]);

  const getMilestoneProgress = useCallback((milestoneNumber: number): number => {
    if (!userJourneyQuery.data || !milestonesQuery.data) return 0;
    
    const userJourney = userJourneyQuery.data;
    const milestone = milestonesQuery.data.find(m => m.milestoneNumber === milestoneNumber);
    
    if (!milestone) return 0;
    
    if (userJourney.currentMilestone < milestoneNumber) {
      return 0;
    }
    
    if (userJourney.claimedMilestones.includes(milestoneNumber)) {
      return 100;
    }
    
    // Calculate progress within current milestone
    const xpInMilestone = userJourney.totalXp - ((milestoneNumber - 1) * 1000); // Assuming 1000 XP per milestone
    return Math.min(100, Math.max(0, (xpInMilestone / 1000) * 100));
  }, [userJourneyQuery.data, milestonesQuery.data]);

  // ============================================================================
  // Derived State
  // ============================================================================

  const hasActiveJourney = !!summaryQuery.data?.activeSeason;
  const hasUnclaimedMilestones = (unclaimedQuery.data?.length || 0) > 0;
  const nextMilestone = userJourneyQuery.data ? userJourneyQuery.data.currentMilestone + 1 : null;
  const xpToNextMilestone = userJourneyQuery.data?.xpToNextMilestone || 0;

  // ============================================================================
  // Error Handling
  // ============================================================================

  const error = summaryQuery.error || userJourneyQuery.error || milestonesQuery.error || null;

  // ============================================================================
  // Return
  // ============================================================================

  return {
    // Data
    summary: summaryQuery.data,
    milestones: milestonesQuery.data || [],
    userJourney: userJourneyQuery.data,
    unclaimedMilestones: unclaimedQuery.data || [],

    // State
    hasActiveJourney,
    hasUnclaimedMilestones,
    nextMilestone,
    xpToNextMilestone,

    // Progress helpers
    canClaimMilestone,
    getMilestoneProgress,

    // Loading states
    isLoading: summaryQuery.isLoading || userJourneyQuery.isLoading,
    isFetching: summaryQuery.isFetching || userJourneyQuery.isFetching,
    isInitializing: initializeMutation.isPending,
    isClaiming: claimMutation.isPending,
    isAddingXp: addXpMutation.isPending,

    // Error states
    error,
    isError: !!error,

    // Actions
    initializeJourney,
    claimMilestone,
    addJourneyXp,

    // Raw queries for advanced use
    queries: {
      summary: summaryQuery,
      milestones: milestonesQuery,
      userJourney: userJourneyQuery,
      unclaimed: unclaimedQuery,
    },
  };
}

// ============================================================================
// Helper Hook: Milestone by Number
// ============================================================================

export function useMilestone(milestoneNumber: number) {
  const { milestones } = useSeasonJourney();
  
  return milestones.find(m => m.milestoneNumber === milestoneNumber) || null;
}

// ============================================================================
// Helper Hook: Journey Progress
// ============================================================================

export function useJourneyProgress() {
  const { userJourney, summary } = useSeasonJourney();
  
  if (!userJourney || !summary) {
    return {
      currentProgress: 0,
      totalProgress: 0,
      daysRemaining: 0,
    };
  }

  const totalMilestones = summary.activeSeason?.milestoneCount || 25;
  const currentProgress = (userJourney.currentMilestone / totalMilestones) * 100;
  const totalProgress = userJourney.totalProgress;
  const daysRemaining = summary.userProgress?.daysRemaining || 0;

  return {
    currentProgress,
    totalProgress,
    daysRemaining,
  };
}
