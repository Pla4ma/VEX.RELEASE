import { z } from "zod";

import { LaneSchema } from "../lane-engine/schemas";

export const UnlockDecisionTypeSchema = z.enum([
  "hidden",
  "teased",
  "unlocked",
  "blocked",
  "degraded",
]);

export const LaneFitSchema = z.enum(["strong", "medium", "weak", "blocked"]);

export const UnlockEvidenceSchema = z
  .object({
    source: z.enum([
      "onboarding",
      "session_count",
      "behavior",
      "lane_profile",
      "manual_override",
      "cold_start",
    ]),
    detail: z.string().min(1),
    observedAt: z.number().int().min(0),
  })
  .strict();

export const UnlockDecisionSchema = z
  .object({
    featureKey: z.string().min(1),
    decision: UnlockDecisionTypeSchema,
    reasonCode: z.string().min(1),
    userFacingReason: z.string().min(1),
    evidence: z.array(UnlockEvidenceSchema),
    laneFit: LaneFitSchema,
    canHide: z.boolean(),
    canReconsiderAtSessionCount: z.number().int().min(0).nullable(),
  })
  .strict();

export const UnlockExplainerInputSchema = z
  .object({
    featureKey: z.string().min(1),
    laneProfile: LaneSchema.optional(),
    sessionCount: z.number().int().min(0),
    isPremium: z.boolean().optional().default(false),
    hasRelatedBehavior: z.boolean().optional().default(false),
    manualOverride: z
      .enum(["hidden", "teased", "unlocked", "blocked", "degraded"])
      .optional(),
  })
  .strict();

export const UnlockReasonCodeSchema = z.enum([
  "day_zero_core",
  "day_zero_tease",
  "final_release_deactivated",
  "lane_blocked",
  "manual_override",
  "teased_before_sessions",
  "unlocked_after_sessions",
  "degraded_premium_blocked",
  "hidden_by_user",
  "never_unlock_baseline",
  "minimal_lane_fewer_unlocks",
]);

export type UnlockReasonCode = z.infer<typeof UnlockReasonCodeSchema>;

type ReasonContext = {
  featureKey: string;
  lane?: string;
  sessionCount: number;
  minSessions: number;
  laneFit: "strong" | "medium" | "weak" | "blocked";
  isPremium: boolean;
  hasRelatedBehavior: boolean;
};

/**
 * Evidence-based, lane-aware, non-manipulative user-facing reason text.
 *
 * Rules:
 * - No FOMO copy.
 * - Cites actual evidence (session count, behavior, lane fit).
 * - Blocked features explain why they're not shown.
 * - Degraded premium does not tease.
 */
export function buildUserFacingReason(
  reasonCode: UnlockReasonCode,
  context: ReasonContext,
): string {
  const { featureKey, lane, sessionCount, minSessions, laneFit } = context;

  const featureNames: Record<string, string> = {
    boss_tab: "Boss encounters",
    focus_session: "Focus sessions",
    home_tab: "Home tab",
    profile_tab: "Profile tab",
    focus_tab: "Focus tab",
    project_thread: "Project Thread",
    rescue_cta: "Rescue mode",
    run_board: "Run Board",
    study_os: "Study tools",
    today_strip: "Today Strip",
  };

  const name = featureNames[featureKey] ?? featureKey;

  switch (reasonCode) {
    case "day_zero_core":
      return `Because ${name} are essential, VEX opened them from your first session.`;

    case "day_zero_tease":
      return `Available after your first session. You are not locked out — just warming up.`;

    case "final_release_deactivated":
      return `This feature is not available in the current version.`;

    case "lane_blocked":
      if (lane === "minimal_normal") {
        return `Because you prefer a clean, distraction-free experience, VEX kept ${name} away from your Home. You can change this in settings.`;
      }
      return `Not available for your current experience style. You can change this in settings.`;

    case "manual_override":
      return `You chose this setting.`;

    case "teased_before_sessions": {
      if (lane === "student" && featureKey === "study_os") {
        return `Because you have completed ${sessionCount} of ${minSessions} study blocks, VEX will open Study tools after ${minSessions - sessionCount} more.`;
      }
      if (lane === "game_like" && featureKey === "run_board") {
        return `Because momentum builds with each encounter, VEX will open Run Board after ${minSessions - sessionCount} more sessions.`;
      }
      if (lane === "deep_creative" && featureKey === "project_thread") {
        return `Because you keep returning to the same project, VEX will open Project Thread after ${minSessions - sessionCount} more sessions.`;
      }
      if (lane === "minimal_normal") {
        return `Because you dismiss extra systems, VEX kept your Home clean. ${name} available after ${minSessions - sessionCount} more sessions if you want it.`;
      }
      return `Available after ${minSessions} completed sessions.`;
    }

    case "unlocked_after_sessions": {
      if (lane === "student" && featureKey === "study_os") {
        return `Because you completed ${sessionCount} study blocks, VEX opened Study tools.`;
      }
      if (lane === "game_like" && featureKey === "run_board") {
        return `Because you respond well to momentum, VEX opened Run Mode.`;
      }
      if (lane === "deep_creative" && featureKey === "project_thread") {
        return `Because you keep returning to the same project, VEX opened Project Thread.`;
      }
      if (lane === "minimal_normal") {
        return `Because you dismiss extra systems, VEX kept your Home clean. ${name} is open if you want it.`;
      }
      if (laneFit === "strong") {
        return `Because ${name} fits how you work, VEX opened it after ${sessionCount} sessions.`;
      }
      return `Because of your progress, VEX opened ${name}.`;
    }

    case "degraded_premium_blocked":
      return `This feature requires premium. It is not teasing you — it stays quiet until you upgrade.`;

    case "hidden_by_user":
      return `You chose to hide this. Reconsider from Settings at any time.`;

    case "never_unlock_baseline":
      return `${name} will never unlock — VEX does not push monetization, gamble, or store mechanics.`;

    case "minimal_lane_fewer_unlocks":
      return `Because you prefer a clean experience, VEX shows fewer new features.`;

    default:
      return `Available when it helps you most.`;
  }
}
