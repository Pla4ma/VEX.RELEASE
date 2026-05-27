import {
  LaneFitSchema,
  UnlockDecisionSchema,
  UnlockExplainerInputSchema,
  buildUserFacingReason,
} from "./schemas";
import type {
  UnlockDecision,
  UnlockExplainerInput,
  UnlockReasonCode,
} from "./types";
import { NEVER_UNLOCK, resolveLaneFit, resolveMinSessions } from "./lane-fit";

export function createUnlockDecision(
  rawInput: UnlockExplainerInput,
): UnlockDecision {
  const input = UnlockExplainerInputSchema.parse(rawInput);
  const now = Date.now();
  const laneFit = resolveLaneFit(input.featureKey, input.laneProfile);

  if (NEVER_UNLOCK.has(input.featureKey)) {
    return UnlockDecisionSchema.parse({
      featureKey: input.featureKey,
      decision: "hidden",
      reasonCode: "final_release_deactivated",
      userFacingReason: buildUserFacingReason("never_unlock_baseline", {
        featureKey: input.featureKey,
        lane: input.laneProfile,
        sessionCount: input.sessionCount,
        minSessions: 0,
        laneFit: "blocked",
        isPremium: input.isPremium,
        hasRelatedBehavior: input.hasRelatedBehavior,
      }),
      evidence: [],
      laneFit: LaneFitSchema.options[3],
      canHide: false,
      canReconsiderAtSessionCount: null,
    });
  }

  if (input.manualOverride) {
    return UnlockDecisionSchema.parse({
      featureKey: input.featureKey,
      decision: input.manualOverride,
      reasonCode: "manual_override",
      userFacingReason: "You chose this setting.",
      evidence: [
        {
          source: "manual_override",
          detail: input.manualOverride,
          observedAt: now,
        },
      ],
      laneFit,
      canHide: input.manualOverride !== "hidden",
      canReconsiderAtSessionCount: null,
    });
  }

  if (input.sessionCount === 0) {
    if (laneFit === "blocked") {
      return UnlockDecisionSchema.parse({
        featureKey: input.featureKey,
        decision: "blocked",
        reasonCode: "lane_blocked",
        userFacingReason: buildUserFacingReason("lane_blocked", {
          featureKey: input.featureKey,
          lane: input.laneProfile,
          sessionCount: input.sessionCount,
          minSessions: 3,
          laneFit: "blocked",
          isPremium: input.isPremium,
          hasRelatedBehavior: input.hasRelatedBehavior,
        }),
        evidence: [
          {
            source: "lane_profile",
            detail: `lane:${input.laneProfile ?? "unknown"}`,
            observedAt: now,
          },
        ],
        laneFit: "blocked",
        canHide: false,
        canReconsiderAtSessionCount: input.sessionCount + 3,
      });
    }
    const isCoreFeature = [
      "focus_session",
      "home_tab",
      "profile_tab",
      "focus_tab",
    ].includes(input.featureKey);
    const reasonCode: UnlockReasonCode = isCoreFeature
      ? "day_zero_core"
      : "day_zero_tease";
    return UnlockDecisionSchema.parse({
      featureKey: input.featureKey,
      decision: isCoreFeature ? "unlocked" : "teased",
      reasonCode,
      userFacingReason: buildUserFacingReason(reasonCode, {
        featureKey: input.featureKey,
        lane: input.laneProfile,
        sessionCount: input.sessionCount,
        minSessions: 1,
        laneFit,
        isPremium: input.isPremium,
        hasRelatedBehavior: input.hasRelatedBehavior,
      }),
      evidence: [
        {
          source: "cold_start",
          detail: `sessionCount:${input.sessionCount}`,
          observedAt: now,
        },
      ],
      laneFit,
      canHide: !isCoreFeature,
      canReconsiderAtSessionCount: isCoreFeature ? null : 1,
    });
  }

  if (laneFit === "blocked") {
    return UnlockDecisionSchema.parse({
      featureKey: input.featureKey,
      decision: "blocked",
      reasonCode: "lane_blocked",
      userFacingReason: buildUserFacingReason("lane_blocked", {
        featureKey: input.featureKey,
        lane: input.laneProfile,
        sessionCount: input.sessionCount,
        minSessions: 3,
        laneFit: "blocked",
        isPremium: input.isPremium,
        hasRelatedBehavior: input.hasRelatedBehavior,
      }),
      evidence: [
        {
          source: "lane_profile",
          detail: `lane:${input.laneProfile ?? "unknown"}`,
          observedAt: now,
        },
      ],
      laneFit: "blocked",
      canHide: false,
      canReconsiderAtSessionCount: input.sessionCount + 3,
    });
  }

  const minSessions = resolveMinSessions(laneFit, input.laneProfile);
  const isUnlocked = input.sessionCount >= minSessions;
  const reasonCode: UnlockReasonCode = isUnlocked
    ? "unlocked_after_sessions"
    : "teased_before_sessions";

  return UnlockDecisionSchema.parse({
    featureKey: input.featureKey,
    decision: isUnlocked ? "unlocked" : "teased",
    reasonCode,
    userFacingReason: buildUserFacingReason(reasonCode, {
      featureKey: input.featureKey,
      lane: input.laneProfile,
      sessionCount: input.sessionCount,
      minSessions,
      laneFit,
      isPremium: input.isPremium,
      hasRelatedBehavior: input.hasRelatedBehavior,
    }),
    evidence: [
      {
        source: "session_count",
        detail: `sessions:${input.sessionCount}`,
        observedAt: now,
      },
      {
        source: "lane_profile",
        detail: `lane:${input.laneProfile ?? "unknown"}`,
        observedAt: now,
      },
    ],
    laneFit,
    canHide: input.sessionCount >= minSessions,
    canReconsiderAtSessionCount: isUnlocked ? null : minSessions,
  });
}

export function getUnlockExplainerCopy(decision: UnlockDecision): {
  body: string;
  cta: string | null;
  title: string;
} {
  const base = {
    body: decision.userFacingReason,
    cta: decision.canHide ? "Got it" : null,
    title:
      decision.decision === "unlocked"
        ? `${decision.featureKey} unlocked`
        : decision.decision === "teased"
          ? `${decision.featureKey} coming soon`
          : decision.decision === "blocked"
            ? `${decision.featureKey} unavailable`
            : "",
  };
  return base;
}

export function isFeatureVisible(decision: UnlockDecision): boolean {
  return decision.decision !== "hidden";
}
