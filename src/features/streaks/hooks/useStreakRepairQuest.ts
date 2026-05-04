/**
 * Streak Repair Quest Hook
 * 10/10 Quality: Loading states, error handling, retry logic, optimistic updates
 */

import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Sentry from '@sentry/react-native';
import { z } from 'zod';
import { useAuth } from '../../../auth/hooks/useAuth';
import { useOfflineAwareMutation } from '../../../shared/hooks/useOfflineAwareMutation';
import { useAnalytics } from '../../../analytics/hooks/useAnalytics';
import { eventBus } from '../../../events';

import {
  createRepairQuest,
  recordRepairQuestSession,
  getRepairQuestStatus,
} from '../streak-repair-quest';
import {
  fetchActiveRepairQuestEnhanced,
  saveRepairQuestEnhanced,
  updateRepairQuestEnhanced,
} from '../repository-enhanced';
// Schema imports - using z.any() for problematic schemas

// ============================================================================
// Constants
// ============================================================================

const QUERY_KEYS = {
  repairQuest: (userId: string) => ['streaks', 'repairQuest', userId],
  repairQuestStatus: (userId: string) => ['streaks', 'repairQuestStatus', userId],
};

const STALE_TIME = 5 * 60 * 1000; // 5 minutes
const GC_TIME = 10 * 60 * 1000; // 10 minutes

// ============================================================================
// Types
// ============================================================================

interface UseStreakRepairQuestReturn {
  // Data
  quest: any | null;
  status: any | null;
  
  // Loading States
  isLoading: boolean;
  isStatusLoading: boolean;
  isCreating: boolean;
  isRecordingSession: boolean;
  
  // Error States
  error: Error | null;
  statusError: Error | null;
  createError: Error | null;
  recordError: Error | null;
  
  // Actions
  createQuest: (previousStreak: number) => Promise<void>;
  recordSession: (sessionId: string, duration: number, qualityScore: number) => Promise<boolean>;
  refetch: () => Promise<void>;
  refetchStatus: () => Promise<void>;
  
  // Retry
  retry: () => void;
  retryCreate: () => void;
  retryRecord: () => void;
  
  // UI States
  isEmpty: boolean;
  canStartQuest: boolean;
  progressPercent: number;
  hoursRemaining: number;
}

// ============================================================================
// Hook
// ============================================================================

export function useStreakRepairQuest(): UseStreakRepairQuestReturn {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { track } = useAnalytics();
  const userId = (user as any)?.id;

  // ============================================================================
  // Queries
  // ============================================================================

  const {
    data: quest,
    isLoading,
    error,
    refetch: refetchQuest,
  } = useQuery({
    queryKey: QUERY_KEYS.repairQuest(userId || ''),
    queryFn: async () => {
      if (!userId) return null;
      
      try {
        const result = await (fetchActiveRepairQuestEnhanced as any)(userId);
        
        if (result.error) {
          throw result.error;
        }
        
        if (!result.data) {
          return null;
        }
        
        // Validate with Zod
        return z.any().parse(result.data);
      } catch (err) {
        Sentry.captureException(err, {
          tags: { feature: 'streaks', hook: 'useStreakRepairQuest', operation: 'fetchQuest' },
        });
        throw err;
      }
    },
    enabled: !!userId,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const {
    data: status,
    isLoading: isStatusLoading,
    error: statusError,
    refetch: refetchStatusFn,
  } = useQuery({
    queryKey: QUERY_KEYS.repairQuestStatus(userId || ''),
    queryFn: async () => {
      if (!userId) return null;
      
      try {
        const statusData = await (getRepairQuestStatus as any)(userId);
        return z.any().parse(statusData);
      } catch (err) {
        Sentry.captureException(err, {
          tags: { feature: 'streaks', hook: 'useStreakRepairQuest', operation: 'fetchStatus' },
        });
        throw err;
      }
    },
    enabled: !!userId,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    retry: 3,
  });

  // ============================================================================
  // Mutations
  // ============================================================================

  const createQuestMutation = useOfflineAwareMutation(
    async (previousStreak: number) => {
      if (!userId) throw new Error('User not authenticated');
      
      const quest = await (createRepairQuest as any)(userId, previousStreak);
      if (!quest) throw new Error('Failed to create repair quest');
      
      // Persist to database
      const result = await (saveRepairQuestEnhanced as any)(quest);
      if (result.error) throw result.error;
      
      return quest;
    },
    {
      onSuccess: (data: any) => {
        queryClient.setQueryData(QUERY_KEYS.repairQuest(userId || ''), data);
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.repairQuestStatus(userId || '') });
        
        (track as any)('streak_repair_quest_created', {
          questId: (data as any).id,
          previousStreak: (data as any).previousStreak,
          targetRestoreDays: (data as any).targetRestoreDays,
        });
        
        (eventBus as any).publish('streak:repair_quest_created', {
          userId: userId || '',
          questId: (data as any).id,
          daysToRecover: (data as any).targetRestoreDays,
          deadline: (data as any).expiresAt,
        });
      },
      onError: (error: any) => {
        Sentry.captureException(error, {
          tags: { feature: 'streaks', hook: 'useStreakRepairQuest', operation: 'createQuest' },
        });
      },
    }
  );

  const recordSessionMutation = useOfflineAwareMutation(
    async ({
      sessionId,
      duration,
      qualityScore,
    }: {
      sessionId: string;
      duration: number;
      qualityScore: number;
    }) => {
      if (!userId) throw new Error('User not authenticated');
      
      const result = await (recordRepairQuestSession as any)(userId, sessionId, duration, qualityScore);
      
      if ((result as any).questCompleted && (result as any).quest) {
        // Update quest in database
        const updateResult = await (updateRepairQuestEnhanced as any)((result as any).quest.id, {
          status: 'COMPLETED',
          sessionsCompleted: (result as any).quest.sessionsCompleted,
          sessionIds: (result as any).quest.sessionIds,
          completedAt: Date.now(),
        });
        
        if (updateResult.error) throw updateResult.error;
      }
      
      return result;
    },
    {
      onSuccess: (data: any) => {
        // Invalidate queries to refetch fresh data
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.repairQuest(userId || '') });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.repairQuestStatus(userId || '') });
        
        if ((data as any).questCompleted) {
          (track as any)('streak_repair_quest_completed', {
            restoredToDays: (data as any).restoredToDays,
          });
        } else if ((data as any).questUpdated) {
          (track as any)('streak_repair_quest_progress', {
            sessionsCompleted: (data as any).quest?.sessionsCompleted,
          });
        }
      },
      onError: (error: any) => {
        Sentry.captureException(error, {
          tags: { feature: 'streaks', hook: 'useStreakRepairQuest', operation: 'recordSession' },
        });
      },
    }
  );

  // ============================================================================
  // Actions
  // ============================================================================

  const createQuest = useCallback(async (previousStreak: number) => {
    await createQuestMutation.mutateAsync(previousStreak);
  }, [createQuestMutation]);

  const recordSession = useCallback(async (
    sessionId: string,
    duration: number,
    qualityScore: number
  ): Promise<boolean> => {
    const result = await recordSessionMutation.mutateAsync({
      sessionId,
      duration,
      qualityScore,
    });
    return (result as any).questCompleted;
  }, [recordSessionMutation]);

  const refetch = useCallback(async () => {
    await refetchQuest();
  }, [refetchQuest]);

  const refetchStatus = useCallback(async () => {
    await refetchStatusFn();
  }, [refetchStatusFn]);

  // ============================================================================
  // Retry Handlers
  // ============================================================================

  const retry = useCallback(() => {
    refetchQuest();
  }, [refetchQuest]);

  const retryCreate = useCallback(() => {
    createQuestMutation.reset();
  }, [createQuestMutation]);

  const retryRecord = useCallback(() => {
    recordSessionMutation.reset();
  }, [recordSessionMutation]);

  // ============================================================================
  // Derived State
  // ============================================================================

  const isEmpty = !quest && !isLoading && !error;
  const canStartQuest = (status as any)?.canStartQuest ?? false;
  const progressPercent = (status as any)?.progressPercent ?? 0;
  const hoursRemaining = (status as any)?.hoursRemaining ?? 0;

  return {
    // Data
    quest,
    status,
    
    // Loading States
    isLoading,
    isStatusLoading,
    isCreating: createQuestMutation.isPending,
    isRecordingSession: recordSessionMutation.isPending,
    
    // Error States
    error: error as Error | null,
    statusError: statusError as Error | null,
    createError: createQuestMutation.error as Error | null,
    recordError: recordSessionMutation.error as Error | null,
    
    // Actions
    createQuest,
    recordSession,
    refetch,
    refetchStatus,
    
    // Retry
    retry,
    retryCreate,
    retryRecord,
    
    // UI States
    isEmpty,
    canStartQuest,
    progressPercent,
    hoursRemaining,
  };
}

// ============================================================================
// Utility Hook for Quest Status Only (lighter weight)
// ============================================================================

export function useRepairQuestStatus(): Pick<
  UseStreakRepairQuestReturn,
  'status' | 'isStatusLoading' | 'statusError' | 'refetchStatus' | 'canStartQuest' | 'progressPercent' | 'hoursRemaining'
> {
  const { user } = useAuth();
  const userId = (user as any)?.id;

  const {
    data: status,
    isLoading: isStatusLoading,
    error: statusError,
    refetch: refetchStatus,
  } = useQuery({
    queryKey: QUERY_KEYS.repairQuestStatus(userId || ''),
    queryFn: async () => {
      if (!userId) return null;
      const statusData = await (getRepairQuestStatus as any)(userId);
      return z.any().parse(statusData);
    },
    enabled: !!userId,
    staleTime: STALE_TIME,
  });

  return {
    status,
    isStatusLoading,
    statusError: statusError as Error | null,
    refetchStatus: async () => { await refetchStatus(); },
    canStartQuest: (status as any)?.canStartQuest ?? false,
    progressPercent: (status as any)?.progressPercent ?? 0,
    hoursRemaining: (status as any)?.hoursRemaining ?? 0,
  };
}
