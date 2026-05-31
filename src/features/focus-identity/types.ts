import type { z } from 'zod';
import {
  FocusScoreBandLabelSchema,
  FocusScoreFactorKeySchema,
  FocusScoreFactorsSchema,
  FocusScoreHistoryPointSchema,
  FocusScoreRecordSchema,
  FocusScoreUpdateInputSchema,
  FocusScoreUpdateResultSchema,
  MonthlyFocusReportSummarySchema,
} from './schemas';

export type FocusScoreBandLabel = z.infer<typeof FocusScoreBandLabelSchema>;
export type FocusScoreFactorKey = z.infer<typeof FocusScoreFactorKeySchema>;
export type FocusScoreFactors = z.infer<typeof FocusScoreFactorsSchema>;
export type FocusScoreHistoryPoint = z.infer<
  typeof FocusScoreHistoryPointSchema
>;
export type FocusScoreRecord = z.infer<typeof FocusScoreRecordSchema>;
export type FocusScoreUpdateInput = z.infer<typeof FocusScoreUpdateInputSchema>;
export type FocusScoreUpdateResult = z.infer<
  typeof FocusScoreUpdateResultSchema
>;
export type MonthlyFocusReportSummary = z.infer<
  typeof MonthlyFocusReportSummarySchema
>;

// New type for FocusScoreDashboardModel
export interface FocusScoreDashboardModel {
  current: FocusScoreRecord | null;
  history: FocusScoreHistoryPoint[];
  monthlyInput: MonthlyFocusReportSummary | null;
  isOffline: boolean;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  isRefetching: boolean;
  isOptionalDataSyncing: boolean;
  optionalDataError: Error | null;
  refetch: () => void;
}
