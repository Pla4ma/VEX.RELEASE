import { useMemo } from "react";

/** Minimal shape the computed hook needs from the report. */
export interface ReportSummary {
  endingScore: number;
  grade: string;
  change: number;
  sessionsCompleted: number;
}

interface ScoreDriver {
  name: string;
  value: string;
}

export interface MonthlyReportComputed {
  scoreDrivers: ScoreDriver[];
  identityStatement: string;
  percentile: number;
}

export function useMonthlyReportComputed(
  report: ReportSummary | undefined
): MonthlyReportComputed {
  const scoreDrivers = useMemo(() => {
    if (!report) {
      return [];
    }
    const drivers: ScoreDriver[] = [];
    if (report.sessionsCompleted >= 15) {
      drivers.push({ name: "Consistency", value: "+23" });
    } else if (report.sessionsCompleted >= 10) {
      drivers.push({ name: "Consistency", value: "+15" });
    } else if (report.sessionsCompleted >= 5) {
      drivers.push({ name: "Consistency", value: "+8" });
    }
    if (report.change < 0) {
      drivers.push({ name: "Boss Damage", value: String(report.change) });
    }
    if (report.grade === "A+" || report.grade === "A") {
      drivers.push({ name: "Purity", value: "+11" });
    } else if (report.grade === "B+" || report.grade === "B") {
      drivers.push({ name: "Purity", value: "+5" });
    }
    return drivers.slice(0, 3);
  }, [report]);

  const identityStatement = useMemo(() => {
    if (!report) {
      return "";
    }
    const statements: Record<string, string> = {
      "A+": "You are a Focus Virtuoso. Your discipline inspires others.",
      A: "You are an Elite Performer. Excellence is your standard.",
      "B+": "You have Exceptional Focus. You are building something great.",
      B: "You have Strong Focus. You are developing powerful habits.",
      C: "You have Good Focus. You are on the right path.",
      D: "You are Developing Focus. Every session makes you stronger.",
    };
    return statements[report.grade] || "Keep building your focus habit.";
  }, [report]);

  const percentile = useMemo(() => {
    if (!report) {
      return 0;
    }
    if (report.endingScore >= 800) return 99;
    if (report.endingScore >= 740) return 95;
    if (report.endingScore >= 670) return 85;
    if (report.endingScore >= 580) return 70;
    if (report.endingScore >= 500) return 50;
    if (report.endingScore >= 420) return 30;
    return 15;
  }, [report]);

  return { scoreDrivers, identityStatement, percentile };
}
