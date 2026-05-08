/**
 * Anti-Duplication Hooks
 *
 * Phase 6.04 - Anti-Duplication Systems
 * React hooks for UI integration with anti-duplication validation
 * Provides real-time feedback and exploit detection warnings
 *
 * Dependencies:
 * - Economy (reward tracking, transaction validation)
 * - Rewards (reward delivery, claim tracking)
 * - Analytics (duplication detection, Sentry reporting)
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import { eventBus } from '../../../events';
import { antiDuplicationService } from './deduplication-service';
import type {
  DeduplicationRequest,
  DeduplicationResult,
  DeduplicationAttempt,
  ExploitDetection,
  DeduplicationAnalytics
} from './schemas';

// ============================================================================
// Query Keys
// ============================================================================

export const antiDuplicationKeys = {
  all: ['anti-duplication'] as const,
  attempts: (userId: string) => [...antiDuplicationKeys.all, 'attempts', userId] as const,
  exploits: (userId: string) => [...antiDuplicationKeys.all, 'exploits', userId] as const,
  analytics: (userId: string, period: string) => [...antiDuplicationKeys.all, 'analytics', userId, period] as const,
  rules: () => [...antiDuplicationKeys.all, 'rules'] as const,
};

// ============================================================================
// Deduplication Validation Hook
// ============================================================================

interface UseValidateDeduplicationOptions {
  onSuccess?: (result: DeduplicationResult) => void;
  onError?: (error: Error) => void;
  onDuplicate?: (result: DeduplicationResult) => void;
  onExploit?: (detection: ExploitDetection) => void;
}

export function useValidateDeduplication(options: UseValidateDeduplicationOptions = {}) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (request: DeduplicationRequest) => {
      return await antiDuplicationService.validateDeduplication(request);
    },
    onSuccess: (result) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: antiDuplicationKeys.attempts(result.request?.userId || ''),
      });

      // Handle duplicate detection
      if (result.result === 'BLOCKED_DUPLICATE') {
        options.onDuplicate?.(result);
      }

      // Handle exploit detection (would be emitted as event)
      if (result.reason?.includes('exploit')) {
        // This would be handled through event emission
      }

      options.onSuccess?.(result);
    },
    onError: (error) => {
      options.onError?.(error);
    },
  });

  return {
    validateDeduplication: mutation.mutate,
    validateDeduplicationAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
    result: mutation.data,
  };
}

// ============================================================================
// Action Validation Hook
// ============================================================================

interface UseActionValidationProps {
  userId: string;
  actionType: string;
  userLevel: number;
  isPremiumUser: boolean;
}

export function useActionValidation(props: UseActionValidationProps) {
  const { validateDeduplicationAsync } = useValidateDeduplication();

  const validateAction = useCallback(async (
    contextData: Record<string, unknown>,
    source: string,
    sourceId?: string,
    metadata?: Record<string, unknown>
  ): Promise<DeduplicationResult> => {
    const request: DeduplicationRequest = {
      userId: props.userId,
      actionType: props.actionType as any,
      contextData,
      source,
      sourceId: sourceId || null,
      metadata: metadata || null,
      userLevel: props.userLevel,
      isPremiumUser: props.isPremiumUser,
    };

    return await validateDeduplicationAsync(request);
  }, [
    validateDeduplicationAsync,
    props.userId,
    props.actionType,
    props.userLevel,
    props.isPremiumUser,
  ]);

  return {
    validateAction,
  };
}

// ============================================================================
// Deduplication Attempts Hook
// ============================================================================

interface UseDeduplicationAttemptsProps {
  userId: string;
  period?: 'hour' | 'day' | 'week';
}

export function useDeduplicationAttempts(props: UseDeduplicationAttemptsProps) {
  const { userId, period = 'day' } = props;

  const query = useQuery({
    queryKey: antiDuplicationKeys.attempts(userId),
    queryFn: async () => {
      // In a real implementation, this would fetch from the database
      // For now, return mock data
      return {
        attempts: [],
        totalCount: 0,
        allowedCount: 0,
        blockedCount: 0,
        errorCount: 0,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const attemptsByActionType = useMemo(() => {
    const byType: Record<string, number> = {};
    query.data?.attempts.forEach(attempt => {
      byType[attempt.actionType] = (byType[attempt.actionType] || 0) + 1;
    });
    return byType;
  }, [query.data]);

  const attemptsByResult = useMemo(() => {
    const byResult: Record<string, number> = {};
    query.data?.attempts.forEach(attempt => {
      byResult[attempt.result] = (byResult[attempt.result] || 0) + 1;
    });
    return byResult;
  }, [query.data]);

  return {
    attempts: query.data?.attempts || [],
    totalCount: query.data?.totalCount || 0,
    allowedCount: query.data?.allowedCount || 0,
    blockedCount: query.data?.blockedCount || 0,
    errorCount: query.data?.errorCount || 0,
    attemptsByActionType,
    attemptsByResult,
    isLoading: query.isPending,
    error: query.error,
    refetch: query.refetch,
  };
}

// ============================================================================
// Exploit Detection Hook
// ============================================================================

interface UseExploitDetectionProps {
  userId: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export function useExploitDetection(props: UseExploitDetectionProps) {
  const { userId, severity } = props;

  const query = useQuery({
    queryKey: antiDuplicationKeys.exploits(userId),
    queryFn: async () => {
      // In a real implementation, this would fetch from the database
      // For now, return mock data
      return {
        detections: [],
        totalCount: 0,
        resolvedCount: 0,
        pendingCount: 0,
        highSeverityCount: 0,
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const detectionsByPattern = useMemo(() => {
    const byPattern: Record<string, number> = {};
    query.data?.detections.forEach(detection => {
      byPattern[detection.patternName] = (byPattern[detection.patternName] || 0) + 1;
    });
    return byPattern;
  }, [query.data]);

  const detectionsBySeverity = useMemo(() => {
    const bySeverity: Record<string, number> = {};
    query.data?.detections.forEach(detection => {
      if (!severity || detection.severity === severity) {
        bySeverity[detection.severity] = (bySeverity[detection.severity] || 0) + 1;
      }
    });
    return bySeverity;
  }, [query.data, severity]);

  const hasHighRiskDetections = useMemo(() => {
    return query.data?.detections.some(d =>
      d.severity === 'HIGH' || d.severity === 'CRITICAL'
    ) || false;
  }, [query.data]);

  return {
    detections: query.data?.detections || [],
    totalCount: query.data?.totalCount || 0,
    resolvedCount: query.data?.resolvedCount || 0,
    pendingCount: query.data?.pendingCount || 0,
    highSeverityCount: query.data?.highSeverityCount || 0,
    detectionsByPattern,
    detectionsBySeverity,
    hasHighRiskDetections,
    isLoading: query.isPending,
    error: query.error,
    refetch: query.refetch,
  };
}

// ============================================================================
// Deduplication Rules Hook
// ============================================================================

export function useDeduplicationRules() {
  const query = useQuery({
    queryKey: antiDuplicationKeys.rules(),
    queryFn: async () => {
      return antiDuplicationService.getDeduplicationRules();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const activeRules = useMemo(() => {
    return query.data?.filter(rule => rule.isActive) || [];
  }, [query.data]);

  const rulesByActionType = useMemo(() => {
    const byType: Record<string, any[]> = {};
    query.data?.forEach(rule => {
      if (!byType[rule.actionType]) {
        byType[rule.actionType] = [];
      }
      byType[rule.actionType].push(rule);
    });
    return byType;
  }, [query.data]);

  return {
    rules: query.data || [],
    activeRules,
    rulesByActionType,
    isLoading: query.isPending,
    error: query.error,
    refetch: query.refetch,
  };
}

// ============================================================================
// Deduplication Analytics Hook
// ============================================================================

interface UseDeduplicationAnalyticsProps {
  userId: string;
  period: 'hourly' | 'daily' | 'weekly';
}

export function useDeduplicationAnalytics(props: UseDeduplicationAnalyticsProps) {
  const { userId, period } = props;

  const query = useQuery({
    queryKey: antiDuplicationKeys.analytics(userId, period),
    queryFn: async () => {
      // In a real implementation, this would fetch analytics data
      // For now, return mock data
      const analytics: DeduplicationAnalytics = {
        period,
        periodStart: Date.now() - (period === 'hourly' ? 3600000 : period === 'daily' ? 86400000 : 604800000),
        periodEnd: Date.now(),
        totalAttempts: 0,
        allowedAttempts: 0,
        blockedDuplicates: 0,
        blockedByRules: 0,
        errors: 0,
        attemptsByActionType: {},
        freeUserAttempts: 0,
        premiumUserAttempts: 0,
        exploitsDetected: 0,
        exploitsResolved: 0,
        averageValidationTime: 0,
      };
      return analytics;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

  const successRate = useMemo(() => {
    if (!query.data?.totalAttempts) return 0;
    return (query.data.allowedAttempts / query.data.totalAttempts) * 100;
  }, [query.data]);

  const duplicateRate = useMemo(() => {
    if (!query.data?.totalAttempts) return 0;
    return (query.data.blockedDuplicates / query.data.totalAttempts) * 100;
  }, [query.data]);

  return {
    analytics: query.data,
    successRate,
    duplicateRate,
    isLoading: query.isPending,
    error: query.error,
    refetch: query.refetch,
  };
}

// ============================================================================
// Duplicate Warning Hook
// ============================================================================

export function useDuplicateWarning() {
  const showWarning = useCallback((
    message: string,
    type: 'info' | 'warning' | 'error' = 'warning',
    onDismiss?: () => void
  ) => {
    // Emit event to show warning toast
    eventBus.emit('ui:show_toast', {
      message,
      type,
      duration: type === 'error' ? 5000 : 3000,
      onDismiss,
      timestamp: Date.now(),
    });
  }, []);

  return {
    showWarning,
  };
}

// ============================================================================
// Exploit Alert Hook
// ============================================================================

export function useExploitAlert() {
  const showAlert = useCallback((
    detection: ExploitDetection,
    onAcknowledge?: () => void
  ) => {
    // Emit event to show exploit alert
    eventBus.emit('anti-duplication:exploit_alert', {
      detection,
      onAcknowledge,
      timestamp: Date.now(),
    });
  }, []);

  return {
    showAlert,
  };
}

// ============================================================================
// Action Status Hook
// ============================================================================

interface UseActionStatusProps {
  userId: string;
  actionType: string;
}

export function useActionStatus(props: UseActionStatusProps) {
  const { userId, actionType } = props;
  const { attempts } = useDeduplicationAttempts({ userId });

  const recentAttempts = useMemo(() => {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    return attempts.filter(attempt =>
      attempt.actionType === actionType &&
      attempt.createdAt > oneHourAgo
    );
  }, [attempts, actionType]);

  const status = useMemo(() => {
    const blockedCount = recentAttempts.filter(a => a.result === 'BLOCKED_DUPLICATE').length;
    const allowedCount = recentAttempts.filter(a => a.result === 'ALLOWED').length;

    let status: 'good' | 'warning' | 'blocked' = 'good';

    if (blockedCount > 2) {
      status = 'blocked';
    } else if (blockedCount > 0 || allowedCount > 10) {
      status = 'warning';
    }

    return {
      status,
      recentAttempts: recentAttempts.length,
      blockedCount,
      allowedCount,
      canAttempt: status !== 'blocked',
    };
  }, [recentAttempts]);

  return status;
}

// ============================================================================
// Anti-Duplication Event Handlers Hook
// ============================================================================

export function useAntiDuplicationEvents() {
  const { showWarning } = useDuplicateWarning();
  const { showAlert } = useExploitAlert();

  // Handle duplicate detected events
  const handleDuplicateDetected = useCallback((data: { result: DeduplicationResult }) => {
    const { result } = data;

    if (result.result === 'BLOCKED_DUPLICATE') {
      showWarning(result.warningMessage || 'Duplicate action detected', 'warning');
    }
  }, [showWarning]);

  // Handle exploit detected events
  const handleExploitDetected = useCallback((data: { detection: ExploitDetection }) => {
    const { detection } = data;

    if (detection.severity === 'HIGH' || detection.severity === 'CRITICAL') {
      showAlert(detection);
    } else {
      showWarning('Suspicious activity detected', 'warning');
    }
  }, [showAlert, showWarning]);

  return {
    handleDuplicateDetected,
    handleExploitDetected,
  };
}
