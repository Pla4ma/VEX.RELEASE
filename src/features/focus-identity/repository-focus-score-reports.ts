import { getSupabaseClient } from "../../config/supabase";
import {
  MonthInputSchema,
  MonthlyFocusReportInputSchema,
  type MonthlyFocusReportInput,
} from "./repository-focus-score.schemas";
import { createDebugger } from "../../utils/debug";
import {
  FocusIdentityRepositoryError,
  mapHistoryRowToPoint,
} from "./repository-focus-score-mappers";

const debug = createDebugger("focus-identity:repository");

export async function fetchMonthlyFocusReportInput(
  userId: string,
  month: string,
): Promise<MonthlyFocusReportInput> {
  const validatedMonth = MonthInputSchema.parse(month);
  const monthParts = validatedMonth.split("-");
  const yearPart = Number(monthParts[0]);
  const monthPart = Number(monthParts[1]);
  if (isNaN(yearPart) || isNaN(monthPart)) {
    throw new FocusIdentityRepositoryError(
      "fetchMonthlyFocusReportInput:invalid-month",
      validatedMonth,
    );
  }
  const monthStart = new Date(Date.UTC(yearPart, monthPart - 1, 1));
  const monthEnd = new Date(Date.UTC(yearPart, monthPart, 1));
  try {
    const supabase = getSupabaseClient();
    const { data: historyRows, error: historyError } = await supabase
      .from("focus_score_history")
      .select("user_id, occurred_at, score, delta, reason")
      .eq("user_id", userId)
      .gte("occurred_at", monthStart.toISOString())
      .lt("occurred_at", monthEnd.toISOString())
      .order("occurred_at", { ascending: true });
    if (historyError) {
      debug.warn("Supabase history fetch failed", historyError);
    }
    const monthHistory = (historyRows ?? []).map(mapHistoryRowToPoint);
    const { data: sessionRows, error: sessionError } = await supabase
      .from("sessions")
      .select(
        "duration, effective_duration, quality_score, status, completed_at",
      )
      .eq("user_id", userId)
      .eq("status", "completed")
      .gte("completed_at", monthStart.toISOString())
      .lt("completed_at", monthEnd.toISOString());
    if (sessionError) {
      throw new FocusIdentityRepositoryError(
        "fetchMonthlyFocusReportInput:sessions-failed",
        sessionError,
      );
    }
    const rows = sessionRows ?? [];
    const totalFocusedMinutes = Math.floor(
      rows.reduce(
        (sum, row) =>
          sum +
          (typeof row.effective_duration === "number"
            ? row.effective_duration
            : row.duration),
        0,
      ) / 60,
    );
    const bestQuality = rows.reduce(
      (best, row) => Math.max(best, row.quality_score ?? 0),
      0,
    );
    const bestGrade =
      bestQuality >= 95
        ? "S"
        : bestQuality >= 85
          ? "A"
          : bestQuality >= 70
            ? "B"
            : bestQuality >= 55
              ? "C"
              : "D";
    return MonthlyFocusReportInputSchema.parse({
      userId,
      month: validatedMonth,
      historyPoints: monthHistory,
      sessionsCompleted: rows.length,
      totalFocusedMinutes,
      bestGrade,
    });
  } catch (err) {
    debug.error(
      "Unexpected error in fetchMonthlyFocusReportInput",
      err as Error,
    );
    return MonthlyFocusReportInputSchema.parse({
      userId,
      month: validatedMonth,
      historyPoints: [],
      sessionsCompleted: 0,
      totalFocusedMinutes: 0,
      bestGrade: "D",
    });
  }
}
