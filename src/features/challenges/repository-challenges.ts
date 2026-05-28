import { getSupabaseClient } from "../../config/supabase";
import {
  ChallengeSchema,
  type Challenge,
  type ChallengeTemplate,
  type UserChallenge,
  ChallengeTemplateSchema,
  UserChallengeSchema,
} from "./schemas";
import {
  RepositoryError,
  baseJoinedSelect,
  mapJoinedChallenge,
} from "./repository-helpers";
import type { ChallengeDetail } from "./schemas";

const supabase = getSupabaseClient();

export { RepositoryError } from "./repository-helpers";

export async function fetchChallengeById(
  challengeId: string,
): Promise<Challenge | null> {
  const { data, error } = await supabase
    .from("challenges")
    .select("*")
    .eq("id", challengeId)
    .maybeSingle();
  if (error) {
    throw new RepositoryError("fetchChallengeById", error);
  }
  return data ? ChallengeSchema.parse(data) : null;
}

export async function fetchActiveChallenges(
  seasonId: string,
): Promise<Challenge[]> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("challenges")
    .select("*")
    .eq("season_id", seasonId)
    .eq("is_active", true)
    .lte("start_at", now)
    .gte("end_at", now);
  if (error) {
    throw new RepositoryError("fetchActiveChallenges", error);
  }
  return (data ?? []).map((row) => ChallengeSchema.parse(row));
}

export async function fetchChallengesByType(
  seasonId: string,
  type: "DAILY" | "WEEKLY" | "EVENT",
): Promise<Challenge[]> {
  const { data, error } = await supabase
    .from("challenges")
    .select("*")
    .eq("season_id", seasonId)
    .eq("type", type)
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  if (error) {
    throw new RepositoryError("fetchChallengesByType", error);
  }
  return (data ?? []).map((row) => ChallengeSchema.parse(row));
}

export async function fetchChallengeTemplates(): Promise<ChallengeTemplate[]> {
  const { data, error } = await supabase
    .from("challenge_templates")
    .select("*")
    .eq("is_active", true);
  if (error) {
    throw new RepositoryError("fetchChallengeTemplates", error);
  }
  return (data ?? []).map((row) => ChallengeTemplateSchema.parse(row));
}
