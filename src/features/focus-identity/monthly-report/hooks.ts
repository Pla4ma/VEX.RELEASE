/**
 * Monthly Focus Report Hooks
 *
 * React hooks for accessing monthly report data and state.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Sentry from '@sentry/react-native';
import { useToast } from '../../../shared/ui/components/Toast';
import * as service from './service';
import { useAuthStore } from '../../../store';
import { lightColors } from '@/theme/tokens/colors';


// ============================================================================
// Query Keys
// ============================================================================

export const monthlyReportKeys = {
  all: ['monthly-reports'] as const,
  byUser: (userId: string) =>
    [...monthlyReportKeys.all, 'user', userId] as const,
  report: (userId: string, year: number, month: number) =>
    [...monthlyReportKeys.byUser(userId), 'report', year, month] as const,
  preview: (userId: string, year: number, month: number) =>
    [...monthlyReportKeys.byUser(userId), 'preview', year, month] as const,
};

// ============================================================================
// Read Hooks
// ============================================================================

export function useMonthlyReport(userId: string, year: number, month: number) {
  return useQuery({
    queryKey: monthlyReportKeys.report(userId, year, month),
    queryFn: () => service.generateMonthlyReport(userId, year, month),
    enabled: !!userId,
    staleTime: 1000 * 60 * 30, // 30 minutes
    refetchInterval: 1000 * 60 * 60 * 6, // Refresh every 6 hours
  });
}

export function useMonthlyReportPreview(
  userId: string,
  year: number,
  month: number,
) {
  return useQuery({
    queryKey: monthlyReportKeys.preview(userId, year, month),
    queryFn: () => service.generateMonthlyReportPreview(userId, year, month),
    enabled: !!userId,
    staleTime: 1000 * 60 * 15, // 15 minutes for preview
  });
}

export function useCurrentMonthlyReport() {
  const userId = useAuthStore((state) => state.user?.id);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // JavaScript months are 0-indexed

  return useMonthlyReport(userId || '', year, month);
}

export function useCurrentMonthlyReportPreview() {
  const userId = useAuthStore((state) => state.user?.id);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // JavaScript months are 0-indexed

  return useMonthlyReportPreview(userId || '', year, month);
}

// ============================================================================
// Mutation Hooks
// ============================================================================

export function useRefreshMonthlyReport() {
  const queryClient = useQueryClient();
  const { show } = useToast();

  return useMutation({
    mutationFn: async ({
      userId,
      year,
      month,
    }: {
      userId: string;
      year: number;
      month: number;
    }) => {
      return service.generateMonthlyReport(userId, year, month);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: monthlyReportKeys.report(
          variables.userId,
          variables.year,
          variables.month,
        ),
      });
      queryClient.invalidateQueries({
        queryKey: monthlyReportKeys.preview(
          variables.userId,
          variables.year,
          variables.month,
        ),
      });
    },
    onError: (error) => {
      Sentry.captureException(error, { tags: { feature: 'monthly-report', operation: 'refreshMonthlyReport' } });
      show({ type: 'error', title: 'Report not refreshed', message: 'Try again when connection returns.' });
    },
  });
}

// ============================================================================
// Utility Hooks
// ============================================================================

export function useMonthlyReportGrade(grade: string | undefined) {
  return {
    color: getGradeColor(grade),
    label: getGradeLabel(grade),
  };
}

function getGradeColor(grade?: string): string {
  switch (grade) {
    case 'A+':
      return lightColors.semantic.danger;
    case 'A':
      return lightColors.semantic.warning;
    case 'B':
      return lightColors.semantic.vexGold;
    case 'C':
      return lightColors.semantic.success;
    case 'D':
      return lightColors.accent.blue;
    case 'F':
      return lightColors.text.muted;
    default:
      return lightColors.text.muted;
  }
}

function getGradeLabel(grade?: string): string {
  switch (grade) {
    case 'A+':
      return 'Exceptional';
    case 'A':
      return 'Excellent';
    case 'B':
      return 'Good';
    case 'C':
      return 'Average';
    case 'D':
      return 'Below Average';
    case 'F':
      return 'Needs Improvement';
    default:
      return 'Not Graded';
  }
}
