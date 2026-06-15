import { useQuery } from '@tanstack/react-query';
import { generateMonthlyReport } from './service';
import type { MonthlyFocusReportInput } from './types';

export function useMonthlyReport(input: MonthlyFocusReportInput) {
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['monthly-report', input.userId, input.month, input.year],
    queryFn: () => generateMonthlyReport(input),
    staleTime: 1000 * 60 * 60, // 1 hour
    });





  return {
    report: data,
    isPending: isPending,
    isError: isError,
    error: error,
    refetch: refetch,
  };
}
