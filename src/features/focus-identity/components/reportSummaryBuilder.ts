import { MonthlyReportUiAliasesSchema } from '../schemas';

export interface ReportSummaryDisplay {
  endingScore: number;
  grade: string;
  change: number;
  sessionsCompleted: number;
  highlight: string;
  month: string;
}

/**
 * Builds a display-friendly summary from a raw monthly report object.
 * Handles field aliases and fallbacks for different report shapes.
 */
export function buildReportSummary(
  report: Record<string, unknown>,
): ReportSummaryDisplay {
  const aliases = MonthlyReportUiAliasesSchema.parse(report);
  const numericMonth =
    typeof aliases.month === 'number' ? aliases.month : (report.month as number | undefined);
  const displayMonth =
    typeof aliases.month === 'string'
      ? aliases.month
      : new Date(
          report.year as number,
          (numericMonth ?? 1) - 1,
          1,
        ).toLocaleString('en-US', {
          month: 'long',
          year: 'numeric',
        });

  return {
    endingScore: report.endingScore as number,
    grade: report.grade as string,
    change:
      aliases.change ??
      (report.scoreDelta as number | undefined) ??
      0,
    sessionsCompleted:
      aliases.sessionsCompleted ??
      (report.sessionCount as number | undefined) ??
      0,
    highlight:
      aliases.highlight ??
      (report.insight as string | undefined) ??
      (report.strongestPattern as string | undefined) ??
      '',
    month: displayMonth,
  };
}
