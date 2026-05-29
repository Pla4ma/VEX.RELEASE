/**
 * Audit helper for Phase 3 Lane Polish tests.
 */

import {
  getLaneMechanicPolicy,
  type Lane,
  type LaneProfile,
} from "../../lane-engine";
import { buildLaneSessionBrief } from "../../session-start/service";
import { decideNudge } from "../../notification-policy/service";
import { resolveCompletionExperiencePolicy } from "../../session-completion/completion-experience-policy";
import { resolveLaneCopy } from "../../personalization/first-week-lane-copy";
import { LANE_USER_FACING_NAMES } from "../../lane-engine/schemas";
import type { CompletionExperiencePolicyInput } from "../../session-completion/completion-experience-policy-schemas";
import { baseLaneProfile, completionInput } from "./helpers";

export function auditLane(lane: Lane): string {
  const profile = baseLaneProfile({ primaryLane: lane });
  const policy = getLaneMechanicPolicy(profile);
  const brief = buildLaneSessionBrief({ lane });
  const nudge = decideNudge({
    lane,
    completedSessions: 0,
    daysSinceOnboarding: 0,
    sentToday: 0,
    recentDismissals: 0,
    quietHoursActive: false,
    userMuted: false,
    manuallyScheduled: false,
    now: Date.now(),
    context: "none",
    pausedCategories: [],
  });
  const input = completionInput({
    lane,
    motivationStyle: lane === "minimal_normal" ? "calm" : "coach_led",
    sessionMode: brief.sessionMode,
  });
  const completion = resolveCompletionExperiencePolicy(input);
  const day0Copy = resolveLaneCopy("DAY_0_NOT_STARTED", profile, "fallback");

  return [
    `Lane: ${lane} (${LANE_USER_FACING_NAMES[lane]})`,
    `  Day 0 surface: ${day0Copy.laneStageTheme}, "${day0Copy.primaryMessage}"`,
    `  Session mode: ${brief.sessionMode}, CTA: "${brief.ctaLabel}"`,
    `  Completion: animation=${completion.animationLevel}, payoff=${completion.adaptivePayoff}, next=${completion.nextAction}`,
    `  Notification budget: ${nudge.budgetRemaining}/${nudge.lane === "minimal_normal" ? 1 : 2}/day`,
    `  Preferred: ${policy.preferredMechanics.join(", ")}`,
    `  Blocked: ${policy.blockedMechanics.join(", ")}`,
    `  Hidden completion surfaces: ${completion.hiddenCompletionSurfaces.length}`,
    "",
  ].join("\n");
}
