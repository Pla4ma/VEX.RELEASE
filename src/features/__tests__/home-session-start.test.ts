import {
  decideHomeSurfaces,
  resolveLaneCopy,
  resolveFirstWeekExperiment,
  buildLaneSessionBrief,
  baseLaneProfile,
  baseStats,
  baseProfile,
  featureAvailability,
} from "./helpers";

describe("Home (decideHomeSurfaces)", () => {
  it("student LaneProfile → surfaces Study OS and blocks boss full CTA", () => {
    const map = decideHomeSurfaces({
      behaviorStats: baseStats,
      featureAvailability,
      hasActiveBoss: false,
      hasActiveRecommendation: false,
      hasActiveStudyPlan: true,
      isFirstSession: false,
      personalizationProfile: baseProfile,
      laneProfile: { primaryLane: "student" },
    });
    expect(map.study_os).not.toBe("hidden");
    expect(map.boss_full_cta).not.toBe("primary");
  });

  it("game_like LaneProfile → surfaces run_board", () => {
    const map = decideHomeSurfaces({
      behaviorStats: { ...baseStats, bossChallengeEngagement: "medium" },
      featureAvailability,
      hasActiveBoss: true,
      hasActiveRecommendation: false,
      hasActiveStudyPlan: false,
      isFirstSession: false,
      personalizationProfile: baseProfile,
      laneProfile: { primaryLane: "game_like" },
    });
    expect(map.run_board).not.toBe("hidden");
  });

  it("deep_creative LaneProfile → surfaces project_thread and focus_window", () => {
    const map = decideHomeSurfaces({
      behaviorStats: { ...baseStats, projectFocusUsageRatio: 0.6 },
      featureAvailability,
      hasActiveBoss: false,
      hasActiveRecommendation: false,
      hasActiveStudyPlan: false,
      isFirstSession: false,
      personalizationProfile: baseProfile,
      laneProfile: { primaryLane: "deep_creative" },
    });
    expect(map.project_thread).not.toBe("hidden");
    expect(map.focus_window).not.toBe("hidden");
  });

  it("minimal_normal LaneProfile → surfaces today_strip and blocks boss noise", () => {
    const map = decideHomeSurfaces({
      behaviorStats: baseStats,
      featureAvailability,
      hasActiveBoss: false,
      hasActiveRecommendation: false,
      hasActiveStudyPlan: false,
      isFirstSession: false,
      personalizationProfile: {
        ...baseProfile,
        gamificationIntensity: "minimal",
        motivationStyle: "calm",
      },
      laneProfile: { primaryLane: "minimal_normal" },
    });
    expect(map.today_strip).not.toBe("hidden");
    expect(map.boss_full_cta).toBe("blocked");
  });
});

describe("FirstWeek (resolveLaneCopy)", () => {
  it("student LaneProfile → study block Day 0 copy", () => {
    const copy = resolveLaneCopy(
      "DAY_0_NOT_STARTED",
      baseLaneProfile({ primaryLane: "student" }),
      "fallback",
    );
    expect(copy.primaryMessage).toContain("study block");
    expect(copy.laneStageTheme).toBe("first_study_block");
  });

  it("game_like LaneProfile → run Day 0 copy", () => {
    const copy = resolveLaneCopy(
      "DAY_0_NOT_STARTED",
      baseLaneProfile({ primaryLane: "game_like" }),
      "fallback",
    );
    expect(copy.primaryMessage).toContain("run");
    expect(copy.laneStageTheme).toBe("first_focus_run");
  });

  it("deep_creative LaneProfile → project Day 0 copy", () => {
    const copy = resolveLaneCopy(
      "DAY_0_NOT_STARTED",
      baseLaneProfile({ primaryLane: "deep_creative" }),
      "fallback",
    );
    expect(copy.primaryMessage).toContain("project");
    expect(copy.laneStageTheme).toBe("first_project_block");
  });

  it("minimal_normal LaneProfile → clean session Day 0 copy", () => {
    const copy = resolveLaneCopy(
      "DAY_0_NOT_STARTED",
      baseLaneProfile({ primaryLane: "minimal_normal" }),
      "fallback",
    );
    expect(copy.primaryMessage).toContain("clean");
    expect(copy.laneStageTheme).toBe("first_clean_session");
  });

  it("resolveFirstWeekExperiment consumes Lane (derived from LaneProfile.primaryLane)", () => {
    const exp = resolveFirstWeekExperiment("student", "DAY_5_PATH_FORMING");
    expect(exp).not.toBeNull();
    expect(exp!.action).toContain("study block");
  });
});

describe("SessionStart (buildLaneSessionBrief)", () => {
  it("student lane → STUDY mode with study block CTA", () => {
    const brief = buildLaneSessionBrief({
      lane: "student",
      durationSeconds: 25 * 60,
    });
    expect(brief.sessionMode).toBe("STUDY");
    expect(brief.ctaLabel).toBe("Start study block");
    expect(brief.title).toContain("Study");
  });

  it("game_like lane → SPRINT mode with encounter CTA", () => {
    const brief = buildLaneSessionBrief({
      lane: "game_like",
      durationSeconds: 25 * 60,
    });
    expect(brief.sessionMode).toBe("SPRINT");
    expect(brief.ctaLabel).toBe("Start clean run");
  });

  it("deep_creative lane → CREATIVE mode with project block CTA", () => {
    const brief = buildLaneSessionBrief({
      lane: "deep_creative",
      durationSeconds: 25 * 60,
    });
    expect(brief.sessionMode).toBe("CREATIVE");
    expect(brief.ctaLabel).toBe("Resume project block");
  });

  it("minimal_normal lane → LIGHT_FOCUS mode with clean session CTA", () => {
    const brief = buildLaneSessionBrief({
      lane: "minimal_normal",
      durationSeconds: 25 * 60,
    });
    expect(brief.sessionMode).toBe("LIGHT_FOCUS");
    expect(brief.ctaLabel).toBe("Start clean action");
  });

  it("no old economy surfaces in lane brief output", () => {
    const brief = buildLaneSessionBrief({ lane: "game_like" });
    const json = JSON.stringify(brief);
    expect(json).not.toMatch(
      /wager|insuranceCost|bountyCost|wallet|gem|shop|inventory/i,
    );
  });
});
