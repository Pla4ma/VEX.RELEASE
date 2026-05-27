import {
  getLaneMechanicPolicy,
  buildLaneSessionBrief,
  resolveFirstWeekExperience,
  decideHomeSurfaces,
  SessionMode,
  baseLaneProfile,
  baseStats,
} from "./helpers";

describe("Risk 3 — Run Companion Party-Mode Gating", () => {
  it("companion_party_member and optional_party_mode only in game_like", () => {
    const runPolicy = getLaneMechanicPolicy(
      baseLaneProfile({ primaryLane: "game_like" }),
    );
    expect(runPolicy.preferredMechanics).toContain("companion_party_member");
    expect(runPolicy.preferredMechanics).toContain("optional_party_mode");

    for (const lane of [
      "student",
      "deep_creative",
      "minimal_normal",
    ] as const) {
      const policy = getLaneMechanicPolicy(
        baseLaneProfile({ primaryLane: lane }),
      );
      expect(policy.preferredMechanics).not.toContain("companion_party_member");
      expect(policy.preferredMechanics).not.toContain("optional_party_mode");
    }
  });

  it("Clean blocks companion_chores; game_like omits chores from preferred", () => {
    const cleanPolicy = getLaneMechanicPolicy(
      baseLaneProfile({ primaryLane: "minimal_normal" }),
    );
    expect(cleanPolicy.blockedMechanics).toContain("companion_chores");

    const runPolicy = getLaneMechanicPolicy(
      baseLaneProfile({ primaryLane: "game_like" }),
    );
    expect(runPolicy.preferredMechanics).not.toContain("companion_chores");
  });

  it("Run brief has encounter CTA, no party/squad language", () => {
    const brief = buildLaneSessionBrief({ lane: "game_like" });
    expect(brief.sessionMode).toBe(SessionMode.SPRINT);
    expect(brief.ctaLabel).toBe("Start encounter");
    expect(brief.title).not.toContain("party");
  });

  it("Run Day 0: game_like gets tiny_boss_teaser, others do not", () => {
    const runDay0 = resolveFirstWeekExperience({
      behaviorStats: baseStats,
      completedSessions: 0,
      daysSinceLastSession: null,
      daysSinceOnboarding: 0,
      featureAvailability: {
        boss: true,
        premium: false,
        social: false,
        study: false,
      },
      motivationStyle: "game_like",
      premiumState: "unavailable",
      primaryGoal: "work",
      laneProfile: baseLaneProfile({ primaryLane: "game_like" }),
    });
    expect(runDay0.allowedHomeSurfaces).toContain("tiny_boss_teaser");

    for (const lane of [
      "student",
      "deep_creative",
      "minimal_normal",
    ] as const) {
      const result = resolveFirstWeekExperience({
        behaviorStats: baseStats,
        completedSessions: 0,
        daysSinceLastSession: null,
        daysSinceOnboarding: 0,
        featureAvailability: {
          boss: true,
          premium: false,
          social: false,
          study: true,
        },
        motivationStyle: "calm",
        premiumState: "unavailable",
        primaryGoal: "work",
        laneProfile: baseLaneProfile({ primaryLane: lane }),
      });
      expect(result.allowedHomeSurfaces).not.toContain("tiny_boss_teaser");
    }
  });
});

describe("Risk 4 — ProjectThread Persistence", () => {
  it("deep_creative prefers project_thread, continuity_memory, next_move", () => {
    const policy = getLaneMechanicPolicy(
      baseLaneProfile({ primaryLane: "deep_creative" }),
    );
    expect(policy.preferredMechanics).toContain("project_thread");
    expect(policy.preferredMechanics).toContain("continuity_memory");
    expect(policy.preferredMechanics).toContain("next_move");
  });

  it("deep_creative blocks loud_combat and study_exam_copy", () => {
    const policy = getLaneMechanicPolicy(
      baseLaneProfile({ primaryLane: "deep_creative" }),
    );
    expect(policy.blockedMechanics).toContain("loud_combat_default");
    expect(policy.blockedMechanics).toContain("study_exam_copy");
  });

  it("Project Day 3 companion observation references project continuity", () => {
    const result = resolveFirstWeekExperience({
      behaviorStats: baseStats,
      completedSessions: 3,
      daysSinceLastSession: null,
      daysSinceOnboarding: 3,
      featureAvailability: {
        boss: false,
        premium: false,
        social: false,
        study: true,
      },
      motivationStyle: "coach_led",
      premiumState: "unavailable",
      primaryGoal: "creative",
      sessionProfile: {
        averageDurationMinutes: 30,
        completions: 3,
        abandonments: 0,
        preferredStartHour: 10,
        consistencyScore: 0.8,
        savedNextMoves: 0,
        longestStreak: 3,
      },
      laneProfile: baseLaneProfile({ primaryLane: "deep_creative" }),
    });
    expect(result.currentDayStage).toBe("DAY_3_COMPANION_CONNECTION");
    expect(result.unlockExplanation).toContain("project");
  });

  it("Project day 5 path references Project Focus Path", () => {
    const result = resolveFirstWeekExperience({
      behaviorStats: baseStats,
      completedSessions: 5,
      daysSinceLastSession: null,
      daysSinceOnboarding: 5,
      featureAvailability: {
        boss: false,
        premium: false,
        social: false,
        study: true,
      },
      motivationStyle: "coach_led",
      premiumState: "unavailable",
      primaryGoal: "creative",
      sessionProfile: {
        averageDurationMinutes: 30,
        completions: 5,
        abandonments: 0,
        preferredStartHour: 14,
        consistencyScore: 0.6,
        savedNextMoves: 3,
        longestStreak: 3,
      },
      laneProfile: baseLaneProfile({ primaryLane: "deep_creative" }),
    });
    expect(result.currentDayStage).toBe("DAY_5_PATH_FORMING");
    expect(result.unlockExplanation).toContain("Project Focus Path");
  });

  it("Project day 7 weekly intelligence references creative flow", () => {
    const result = resolveFirstWeekExperience({
      behaviorStats: baseStats,
      completedSessions: 7,
      daysSinceLastSession: null,
      daysSinceOnboarding: 7,
      featureAvailability: {
        boss: false,
        premium: false,
        social: false,
        study: true,
      },
      motivationStyle: "coach_led",
      premiumState: "unavailable",
      primaryGoal: "creative",
      sessionProfile: {
        averageDurationMinutes: 45,
        completions: 7,
        abandonments: 0,
        preferredStartHour: 9,
        consistencyScore: 0.75,
        savedNextMoves: 4,
        longestStreak: 5,
      },
      laneProfile: baseLaneProfile({ primaryLane: "deep_creative" }),
    });
    expect(result.currentDayStage).toBe("DAY_7_DEEPER_MODE");
    expect(result.primaryMessage).toContain("creative");
  });

  it("Project home surfaces show project_thread and focus_window after engagement", () => {
    const map = decideHomeSurfaces({
      behaviorStats: {
        bossChallengeEngagement: "none" as const,
        coachInteractions: 0,
        comebackSessions: 0,
        completionStreak: 0,
        ignoredFeatures: [],
        premiumFeatureAttempts: [],
        studyUsageRatio: 0,
        totalCompletedSessions: 5,
        projectFocusUsageRatio: 0.7,
      },
      featureAvailability: {
        boss: true,
        challenges: true,
        premium: true,
        study: true,
      },
      hasActiveBoss: false,
      hasActiveRecommendation: false,
      hasActiveStudyPlan: false,
      isFirstSession: false,
      personalizationProfile: {
        gamificationIntensity: "medium" as const,
        motivationStyle: "coach_led" as const,
        primaryGoal: "creative" as const,
        studyLayerName: "Deep Work Plan",
        userStage: "engaged" as const,
      },
      laneProfile: baseLaneProfile({ primaryLane: "deep_creative" }),
    });
    expect(map.project_thread).not.toBe("hidden");
    expect(map.focus_window).not.toBe("hidden");
  });
});
