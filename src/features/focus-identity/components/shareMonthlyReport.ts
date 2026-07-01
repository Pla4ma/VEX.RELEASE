import { Share } from 'react-native';
import { capture } from '../../../shared/analytics/analytics-service';
import { publishMonthlyReportShared } from '../events';
import type { ReportSummaryDisplay } from './reportSummaryBuilder';

/**
 * Shares the monthly focus report via the system share sheet.
 * On success, publishes the share event for analytics.
 */
export async function shareMonthlyReport(
  summary: ReportSummaryDisplay,
  identityStatement: string,
  grade: string,
  userId: string,
  percentile: number,
): Promise<void> {
  const shareText = [
    `Monthly Focus Report - ${summary.month}`,
    '',
    identityStatement,
    '',
    `Score: ${summary.endingScore} (${summary.change > 0 ? '+' : ''}${summary.change})`,
    `Grade: ${grade}`,
    `Sessions: ${summary.sessionsCompleted}`,
    `Percentile: Top ${100 - percentile}%`,
    '',
    summary.highlight,
    '',
    '#VEX #FocusProductivity',
  ].join('\n');

  try {
    await Share.share({ message: shareText, title: 'Monthly Focus Report' });
    publishMonthlyReportShared(userId, summary.month, grade);
  } catch (shareError) {
    if (shareError instanceof Error) {
      capture('monthly_report_share_failed', { error: shareError.message });
    }
  }
}
