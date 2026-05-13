import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { eventBus } from "../../../events";
import { antiDuplicationService } from "./deduplication-service";
import type { DeduplicationRequest, DeduplicationResult, DeduplicationAttempt, ExploitDetection, DeduplicationAnalytics } from "./schemas";


export const antiDuplicationKeys = {
  all: ['anti-duplication'] as const,
  attempts: (userId: string) => [...antiDuplicationKeys.all, 'attempts', userId] as const,
  exploits: (userId: string) => [...antiDuplicationKeys.all, 'exploits', userId] as const,
  analytics: (userId: string, period: string) => [...antiDuplicationKeys.all, 'analytics', userId, period] as const,
  rules: () => [...antiDuplicationKeys.all, 'rules'] as const,
};

export function useValidateDeduplication(options: UseValidateDeduplicationOptions = {}) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (request: DeduplicationRequest) => {
      return await antiDuplicationService.validateDeduplication(request);
    },
    onSuccess: (result) => {
      // Invalidate related queries (using result.deduplicationKey if available)
      if (result.deduplicationKey) {
        queryClient.invalidateQueries({
          queryKey: antiDuplicationKeys.attempts(result.deduplicationKey),
        });
      }

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

export function useDeduplicationAttempts(props: UseDeduplicationAttemptsProps) {
  const { userId, period = 'day' } = props;

  const query = useQuery<DeduplicationAttemptsData>({
    queryKey: antiDuplicationKeys.attempts(userId),
    queryFn: async (): Promise<DeduplicationAttemptsData> => {
      return {
        attempts: [],
        totalCount: 0,
        allowedCount: 0,
        blockedCount: 0,
        errorCount: 0,
      };
    },
    staleTime: 5 * 60 * 1000,
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

export function useExploitDetection(props: UseExploitDetectionProps) {
  const { userId, severity } = props;

  const query = useQuery<ExploitDetectionData>({
    queryKey: antiDuplicationKeys.exploits(userId),
    queryFn: async (): Promise<ExploitDetectionData> => {
      return {
        detections: [],
        totalCount: 0,
        resolvedCount: 0,
        pendingCount: 0,
        highSeverityCount: 0,
      };
    },
    staleTime: 2 * 60 * 1000,
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