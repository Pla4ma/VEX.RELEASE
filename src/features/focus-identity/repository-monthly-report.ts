import { captureSilentFailure } from "../../utils/silent-failure";
import { getSupabaseClient } from "../../config/supabase";
import { RepositoryError, withRetry } from "./repository-helpers";

export interface MonthlyReportData {
  month: string;
  startingScore: number;
  endingScore: number;
  change: number;
  sessionsCompleted: number;
  grade: "A+" | "A" | "B+" | "B" | "C" | "D";
  highlight: string;
}

export async function getMonthlyReportData(
  userId: string,
  yearMonth: string,
): Promise<MonthlyReportData | null> {
  return withRetry(async () => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("focus_monthly_reports")
      .select("*")
      .eq("user_id", userId)
      .eq("month", yearMonth)
      .single();
    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new RepositoryError("getMonthlyReportData", error);
    }
    return {
      month: data.month,
      startingScore: data.starting_score,
      endingScore: data.ending_score,
      change: data.score_change,
      sessionsCompleted: data.sessions_completed,
      grade: data.grade,
      highlight: data.highlight,
    };
  }, "getMonthlyReportData");
}

export async function saveMonthlyReportData(
  userId: string,
  report: MonthlyReportData,
): Promise<void> {
  return withRetry(async () => {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from("focus_monthly_reports")
      .upsert({
        user_id: userId,
        month: report.month,
        starting_score: report.startingScore,
        ending_score: report.endingScore,
        score_change: report.change,
        sessions_completed: report.sessionsCompleted,
        grade: report.grade,
        highlight: report.highlight,
        updated_at: new Date().toISOString(),
      });
    if (error) {
      throw new RepositoryError("saveMonthlyReportData", error);
    }
  }, "saveMonthlyReportData");
}

export async function isRepositoryHealthy(): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from("focus_identity_profiles")
      .select("count", { count: "exact", head: true });
    return !error;
  } catch (error) {
    captureSilentFailure(error, {
      feature: "focus-identity",
      operation: "network-fallback",
      type: "network",
    });
    return false;
  }
}
