import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { eventBus } from "../../../events";
import { antiDuplicationService } from "./deduplication-service";
import type { DeduplicationRequest, DeduplicationResult, DeduplicationAttempt, ExploitDetection, DeduplicationAnalytics } from "./schemas";


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

export function useDeduplicationAnalytics(props: UseDeduplicationAnalyticsProps) {
  const { userId, period } = props;

  const query = useQuery({
    queryKey: antiDuplicationKeys.analytics(userId, period),
    queryFn: async () => {
      const analytics: DeduplicationAnalytics = {
        period,
        periodStart: Date.now() - (period === 'HOURLY' ? 3600000 : period === 'DAILY' ? 86400000 : 604800000),
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
    if (!query.data?.totalAttempts) {return 0;}
    return (query.data.allowedAttempts / query.data.totalAttempts) * 100;
  }, [query.data]);

  const duplicateRate = useMemo(() => {
    if (!query.data?.totalAttempts) {return 0;}
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