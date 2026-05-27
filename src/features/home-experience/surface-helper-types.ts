import type {
  HomeSurfaceDecision,
  HomeSurfaceKey,
} from "./surface-decision-schemas";
import type { SurfaceDecisionInputSchema } from "./surface-decision-schemas";
import type { z } from "zod";

export type SurfaceDecisionInput = z.infer<typeof SurfaceDecisionInputSchema>;
export type PersonalizationProfile =
  SurfaceDecisionInput["personalizationProfile"];
export type BehaviorStats = SurfaceDecisionInput["behaviorStats"];
export type FirstWeekPhase = SurfaceDecisionInput["firstWeekPhase"];

export type SurfaceMap = Record<HomeSurfaceKey, HomeSurfaceDecision>;

export function createEmptyHomeSurfaceMap(): SurfaceMap {
  return {
    start_session: "primary",
    coach_presence: "hidden",
    progress_proof: "hidden",
    focus_score: "hidden",
    progress_detail: "hidden",
    study_layer: "hidden",
    companion_thread: "hidden",
    boss_teaser: "hidden",
    boss_compact: "hidden",
    boss_full_cta: "hidden",
    challenge_teaser: "hidden",
    unlock_strip: "hidden",
    premium_tease: "hidden",
    weekly_quest: "hidden",
    study_os: "hidden",
    run_board: "hidden",
    project_thread: "hidden",
    today_strip: "hidden",
    rescue_cta: "hidden",
    memory_insight: "hidden",
    weekly_intelligence: "hidden",
    focus_window: "hidden",
  };
}
