import { fetchMonthlyFocusReportInput } from './repository';
import { MonthlyFocusReportSummarySchema } from './schemas';
import type { MonthlyFocusReportInput, MonthlyFocusReportSummary } from './types';
import * as Sentry from '@sentry/react-native';

export class MonthlyReportServiceError extends Error {
  constructor(operation: string, public readonly cause?: unknown) {
    super(`MonthlyReportService ${operation} failed`);
  }
}

export async function generateMonthlyReport(
  input: MonthlyFocusReportInput
): Promise<MonthlyFocusReportSummary> {
  try {
    const report = await fetchMonthlyFocusReportInput(input);
    return MonthlyFocusReportSummarySchema.parse(report);
  } catch (error) {
    Sentry.captureException(error);
    throw new MonthlyReportServiceError('generateReport', error);
  }
}
