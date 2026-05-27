export interface MonthlyReportData {
  month: string;
  startingScore: number;
  endingScore: number;
  change: number;
  sessionsCompleted: number;
  grade: "A+" | "A" | "B+" | "B" | "C" | "D";
  highlight: string;
}
