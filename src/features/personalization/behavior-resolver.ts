import {
  BehaviorResolverInputSchema,
  BehaviorSignalSummarySchema,
  type BehaviorResolverInput,
  type BehaviorSignalSummary,
} from "./behavior-signal-schemas";

const DISMISS_THRESHOLD = 3;
const CLICK_TO_REINFORCE_THRESHOLD = 2;
const PREMIUM_SESSION_MINIMUM = 5;
const SIGNIFICANT_CLICK_WINDOW = 2;

function countByType(
  signals: BehaviorResolverInput["recentSignals"],
  type: string,
): number {
  return signals.filter((s) => s.signalType === type).length;
}

function countDistinctSurfaces(
  signals: BehaviorResolverInput["recentSignals"],
  type: string,
): Set<string> {
  const surfaces = new Set<string>();
  for (const s of signals) {
    if (s.signalType === type) surfaces.add(s.surfaceKey);
  }
  return surfaces;
}

function hasMinimumSignals(
  signals: BehaviorResolverInput["recentSignals"],
  type: string,
  threshold: number,
): boolean {
  return countByType(signals, type) >= threshold;
}

function hasSurfacesDismissedMultipleTimes(
  signals: BehaviorResolverInput["recentSignals"],
): string[] {
  const dismissCounts = new Map<string, number>();
  for (const s of signals) {
    if (s.signalType === "surface_dismissed") {
      const key = s.surfaceKey;
      dismissCounts.set(key, (dismissCounts.get(key) ?? 0) + 1);
    }
  }
  return Array.from(dismissCounts.entries())
    .filter(([, count]) => count >= DISMISS_THRESHOLD)
    .map(([key]) => key);
}

function hasSurfacesClickedMultipleTimes(
  signals: BehaviorResolverInput["recentSignals"],
): string[] {
  const clickCounts = new Map<string, number>();
  for (const s of signals) {
    if (s.signalType === "surface_clicked") {
      const key = s.surfaceKey;
      clickCounts.set(key, (clickCounts.get(key) ?? 0) + 1);
    }
  }
  return Array.from(clickCounts.entries())
    .filter(([, count]) => count >= CLICK_TO_REINFORCE_THRESHOLD)
    .map(([key]) => key);
}

export function resolveUserBehaviorSignals(
  input: BehaviorResolverInput,
): BehaviorSignalSummary {
  const parsed = BehaviorResolverInputSchema.parse(input);
  const { recentSignals, recentSessions, firstWeekExperience } = parsed;

  const dismissedSurfaces = hasSurfacesDismissedMultipleTimes(recentSignals);
  const reinforcedSurfaces = hasSurfacesClickedMultipleTimes(recentSignals);

  const ignoredFeatures = dismissedSurfaces
    .filter((s) => !reinforcedSurfaces.includes(s))
    .slice(0, 5);

  const premiumGateClickedCount = countByType(
    recentSignals,
    "premium_gate_clicked",
  );
  const premiumGateSeenCount = countByType(recentSignals, "premium_gate_seen");
  const premiumAttemptSurfaces = countDistinctSurfaces(
    recentSignals,
    "premium_gate_clicked",
  );
  const premiumFeatureAttempts =
    premiumGateClickedCount >= SIGNIFICANT_CLICK_WINDOW
      ? Array.from(premiumAttemptSurfaces)
      : [];

  const bossCtaClicked = countByType(recentSignals, "boss_cta_clicked");
  const bossRouteOpened = countByType(recentSignals, "boss_route_opened");
  const totalBossSignals = bossCtaClicked + bossRouteOpened;
  let bossEngagement: BehaviorSignalSummary["bossEngagement"] = "none";
  if (totalBossSignals >= 5 && reinforcedSurfaces.includes("boss_compact")) {
    bossEngagement = "high";
  } else if (totalBossSignals >= 2) {
    bossEngagement = "medium";
  } else if (totalBossSignals >= 1) {
    bossEngagement = "low";
  }

  const coachSurfaceClicked = countByType(
    recentSignals,
    "coach_surface_clicked",
  );
  const coachInteractions = Math.max(
    recentSessions.completedSessions > 0 ? 1 : 0,
    coachSurfaceClicked,
  );

  const studySurfaceClicked = countByType(
    recentSignals,
    "study_surface_clicked",
  );
  const studyUsageRatio =
    recentSessions.totalSessions > 0
      ? Math.min(
          1,
          (recentSessions.studySessions + studySurfaceClicked * 0.5) /
            recentSessions.totalSessions,
        )
      : 0;

  const deepWorkSessions = recentSessions.deepWorkSessions ?? 0;
  const deepWorkUsageRatio =
    recentSessions.totalSessions > 0
      ? Math.min(1, deepWorkSessions / recentSessions.totalSessions)
      : 0;

  const learningSessions = recentSessions.learningSessions ?? 0;
  const learningUsageRatio =
    recentSessions.totalSessions > 0
      ? Math.min(1, learningSessions / recentSessions.totalSessions)
      : 0;

  const creativeSessions = recentSessions.creativeSessions ?? 0;
  const projectFocusUsageRatio =
    recentSessions.totalSessions > 0
      ? Math.min(1, creativeSessions / recentSessions.totalSessions)
      : 0;

  const structuredExecutionTotal =
    deepWorkSessions + learningSessions + creativeSessions;
  const structuredExecutionUsageRatio =
    recentSessions.totalSessions > 0
      ? Math.min(
          1,
          (structuredExecutionTotal + studySurfaceClicked * 0.5) /
            recentSessions.totalSessions,
        )
      : 0;

  const premiumAttemptCount = premiumGateClickedCount + premiumGateSeenCount;
  const hasSufficientSessions =
    recentSessions.completedSessions >= PREMIUM_SESSION_MINIMUM;
  const highIntentPremiumActions: string[] = [];
  if (hasSufficientSessions && premiumAttemptCount >= 1) {
    highIntentPremiumActions.push("premium_tease");
  }
  if (hasSufficientSessions && premiumGateClickedCount >= 3) {
    highIntentPremiumActions.push("premium_moment");
  }

  if (firstWeekExperience.isDayZero) {
    return BehaviorSignalSummarySchema.parse({
      ignoredFeatures: [],
      premiumFeatureAttempts: [],
      bossEngagement: "none",
      coachInteractions: 0,
      studyUsageRatio: 0,
      deepWorkUsageRatio: 0,
      learningUsageRatio: 0,
      projectFocusUsageRatio: 0,
      structuredExecutionUsageRatio: 0,
      preferredSessionMode: recentSessions.preferredMode,
      mostSuccessfulTimeOfDay: recentSessions.bestTimeOfDay,
      dismissedSurfaces: [],
      highIntentPremiumActions: [],
      lastWindowSignalCount: recentSignals.length,
    });
  }

  return BehaviorSignalSummarySchema.parse({
    ignoredFeatures,
    premiumFeatureAttempts,
    bossEngagement,
    coachInteractions,
    studyUsageRatio,
    deepWorkUsageRatio,
    learningUsageRatio,
    projectFocusUsageRatio,
    structuredExecutionUsageRatio,
    preferredSessionMode: recentSessions.preferredMode,
    mostSuccessfulTimeOfDay: recentSessions.bestTimeOfDay,
    dismissedSurfaces,
    highIntentPremiumActions,
    lastWindowSignalCount: recentSignals.length,
  });
}
