import { useQuery } from "@tanstack/react-query";
import { generateMonthlyReport } from "./service";
import type { MonthlyFocusReportInput } from "./types";

export function useMonthlyReport(input: MonthlyFocusReportInput) {
  const query = useQuery({
    queryKey: ["monthly-report", input.userId, input.month, input.year],
    queryFn: () => generateMonthlyReport(input),
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  return {
    report: query.data,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
