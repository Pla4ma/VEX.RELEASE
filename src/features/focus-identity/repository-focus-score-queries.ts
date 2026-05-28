import { getSupabaseClient } from "../../config/supabase";
import type { FocusScoreHistoryPoint, FocusScoreRecord } from "./types";
import {
  AppendFocusScoreHistoryEventSchema,
  type AppendFocusScoreHistoryEvent,
  type UpsertCurrentFocusScoreInput,
  UpsertCurrentFocusScoreInputSchema,
} from "./repository-focus-score.schemas";
import { createDebugger } from "../../utils/debug";
import { withResilience } from "../../utils/supabase-resilience";
import {
  FocusIdentityRepositoryError,
  mapCurrentRowToRecord,
  mapHistoryRowToPoint,
} from "./repository-focus-score-mappers";

const debug = createDebugger("focus-identity:repository");

export async function fetchCurrentFocusScore(
  userId: string,
): Promise<FocusScoreRecord | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await withResilience(
    supabase
      .from("focus_score_current")
      .select("*")
      .eq("user_id", userId)
      .single(),
    { operation: "fetchCurrentFocusScore" },
  );
  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new FocusIdentityRepositoryError("fetchCurrentFocusScore", error);
  }
  return mapCurrentRowToRecord(data);
}

export async function upsertCurrentFocusScore(
  userId: string,
  score: UpsertCurrentFocusScoreInput,
): Promise<FocusScoreRecord> {
  const input = UpsertCurrentFocusScoreInputSchema.parse(score);
  const supabase = getSupabaseClient();
  const { data, error } = await withResilience(
    supabase
      .from("focus_score_current")
      .upsert(
        {
          user_id: userId,
          current_score: input.currentScore,
          previous_score: input.previousScore,
          band: input.band,
          factors: input.factors,
          last_change_reason: input.lastChangeReason,
          top_positive_factor: input.topPositiveFactor,
          top_negative_factor: input.topNegativeFactor,
        },
        { onConflict: "user_id" },
      )
      .select("*")
      .single(),
    { operation: "upsertCurrentFocusScore" },
  );
  if (error) {
    if (error.code === "23505") {
      const existing = await fetchCurrentFocusScore(userId);
      if (existing) {
        return existing;
      }
    }
    throw new FocusIdentityRepositoryError("upsertCurrentFocusScore", error);
  }
  return mapCurrentRowToRecord(data);
}

export async function appendFocusScoreHistory(
  event: AppendFocusScoreHistoryEvent,
): Promise<FocusScoreHistoryPoint> {
  const validatedEvent = AppendFocusScoreHistoryEventSchema.parse(event);
  const supabase = getSupabaseClient();
  const { data, error } = await withResilience(
    supabase
      .from("focus_score_history")
      .insert({
        user_id: validatedEvent.userId,
        occurred_at: validatedEvent.timestamp,
        score: validatedEvent.score,
        delta: validatedEvent.delta,
        reason: validatedEvent.reason,
      })
      .select("user_id, occurred_at, score, delta, reason")
      .single(),
    { operation: "appendFocusScoreHistory" },
  );
  if (error) {
    throw new FocusIdentityRepositoryError("appendFocusScoreHistory", error);
  }
  return mapHistoryRowToPoint(data);
}

export async function fetchFocusScoreHistory(
  userId: string,
  days: number,
): Promise<FocusScoreHistoryPoint[]> {
  try {
    const cutoff = new Date();
    cutoff.setUTCDate(cutoff.getUTCDate() - days);
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("focus_score_history")
      .select("user_id, occurred_at, score, delta, reason")
      .eq("user_id", userId)
      .gte("occurred_at", cutoff.toISOString())
      .order("occurred_at", { ascending: true });
    if (error) {
      debug.warn(
        "Supabase fetchFocusScoreHistory failed, returning empty fallback",
        error,
      );
      return [];
    }
    return (data ?? []).map(mapHistoryRowToPoint);
  } catch (err) {
    debug.error("Unexpected error in fetchFocusScoreHistory", err as Error);
    return [];
  }
}
