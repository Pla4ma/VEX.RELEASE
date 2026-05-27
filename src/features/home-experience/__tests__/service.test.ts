import { buildHomeExperienceModel, getHomeStage } from "../service";
import type { FirstWeekExperience } from "../../../features/personalization/first-week-schemas";

function makeFirstWeek(
  overrides: Partial<FirstWeekExperience> = {},
): FirstWeekExperience {
  return {
    allowedHomeSurfaces: [
      "motivation_confirmation",
      "coach_presence_line",
      "start_session",
    ],
    bossIntensity: "hidden",
    coachMessageType: "day_0_not_started",
    comebackState: "none",
    completionEmphasis: "confirmation_coach_progress_next_action",
    currentDayStage: "DAY_0_NOT_STARTED",
    hiddenSurfaces: [],
    notificationAllowedTypes: ["gentle_return"],
    premiumMoment: "none",
    primaryCTA: { intent: "START_SESSION", label: "Start first session" },
    primaryMessage: "VEX is shaped around one clean first block.",
    secondaryCTA: null,
    spotlightSurface: "none",
    studyLayerLabel: "Study OS" as const,
    unlockTease: "VEX opens one layer at a time after real sessions.",
    ...overrides,
  };
}

describe("home experience service", () => {
  it("keeps day zero focused on personalization and the first session", () => {
    const model = buildHomeExperienceModel({
      explicitMotivationStyle: null,
      totalCompletedSessions: 0,
    });

    expect(getHomeStage(0)).toBe("STAGE_0");
    expect(model.visibleSections).toEqual([
      "motivation_style",
      "coach_line",
      "primary_session",
      "single_evolution_teaser",
    ]);
    expect(model.primaryCta).toBe("Start First Session");
    expect(model.teasedElements).toHaveLength(1);
    expect(model.allowedQueries).toEqual([
      "session_stats",
      "onboarding_state",
      "home_priority_minimal",
    ]);
    expect(model.mustNotRun).toContain("boss_query");
    expect(model.mustNotRun).toContain("challenge_query");
  });

  it("personalizes the first teaser by motivation style", () => {
    const study = buildHomeExperienceModel({
      explicitMotivationStyle: "study_focused",
      totalCompletedSessions: 0,
    });
    const game = buildHomeExperienceModel({
      explicitMotivationStyle: "game_like",
      totalCompletedSessions: 0,
    });

    expect(study.studyOsPlacement).toContain("Study");
    expect(game.rpgBossPlacement).toContain("tiny visual");
  });

  it.each([
    [1, "STAGE_1"],
    [2, "STAGE_2"],
    [4, "STAGE_2"],
    [5, "STAGE_3"],
    [9, "STAGE_3"],
    [10, "STAGE_4"],
  ] as const)("maps %i sessions to %s", (sessions, stage) => {
    expect(getHomeStage(sessions)).toBe(stage);
  });
});

describe("TASK 1 — HomeExperiencePrelude around FirstWeekExperience + ResolvedVexExperience", () => {
  it("Day 0 prelude matches FirstWeekExperience fields", () => {
    const fw = makeFirstWeek({
      currentDayStage: "DAY_0_NOT_STARTED",
      allowedHomeSurfaces: [
        "motivation_confirmation",
        "coach_presence_line",
        "start_session",
        "tiny_unlock_preview",
      ],
      unlockTease: "VEX opens one layer at a time after real sessions.",
      premiumMoment: "soft_tease",
    });
    const model = buildHomeExperienceModel({
      explicitMotivationStyle: null,
      totalCompletedSessions: 0,
      resolvedExperience: undefined,
      firstWeekExperience: fw,
    });
    expect(model.primaryCta).toBe("Start first session");
    expect(model.secondaryCta).toBe("Choose style");
    expect(model.teasedElements[0]?.copy).toBe(
      "VEX opens one layer at a time after real sessions.",
    );
    expect(model.mustNotRun).toContain("boss_query");
  });

  it("Study user prelude uses Study OS / Learning label from FirstWeek", () => {
    const fw = makeFirstWeek({
      currentDayStage: "DAY_5_PATH_FORMING",
      studyLayerLabel: "Study OS" as const,
      allowedHomeSurfaces: [
        "coach_presence_line",
        "start_session",
        "progress_proof",
        "study_deep_work_path",
      ],
      primaryCTA: { intent: "CONTINUE_STUDY_PATH", label: "Continue Study OS" },
    });
    const model = buildHomeExperienceModel({
      explicitMotivationStyle: "study_focused",
      totalCompletedSessions: 5,
      resolvedExperience: undefined,
      firstWeekExperience: fw,
    });
    expect(model.studyOsPlacement).toBe("Study OS");
    expect(model.primaryCta).toBe("Continue Study OS");
  });

  it("Calm user prelude avoids boss language", () => {
    const fw = makeFirstWeek({
      bossIntensity: "hidden",
      allowedHomeSurfaces: [
        "coach_presence_line",
        "start_session",
        "progress_proof",
      ],
      currentDayStage: "DAY_5_PATH_FORMING",
    });
    const model = buildHomeExperienceModel({
      explicitMotivationStyle: "calm",
      totalCompletedSessions: 5,
      resolvedExperience: undefined,
      firstWeekExperience: fw,
    });
    expect(model.rpgBossPlacement).toBe(
      "Boss surface blocked during first-week phase.",
    );
    expect(model.spotlight).toBe("progress_rhythm");
  });

  it("Game-like user can see tiny boss tease only when first-week allows it", () => {
    const fw = makeFirstWeek({
      bossIntensity: "tiny_tease",
      allowedHomeSurfaces: [
        "tiny_boss_teaser",
        "coach_presence_line",
        "start_session",
      ],
      currentDayStage: "DAY_1_RETURN",
    });
    const model = buildHomeExperienceModel({
      explicitMotivationStyle: "game_like",
      totalCompletedSessions: 3,
      resolvedExperience: undefined,
      firstWeekExperience: fw,
    });
    expect(model.rpgBossPlacement).not.toContain("blocked");
    expect(model.rpgBossPlacement).toContain("hint");
  });

  it("Game-like user boss is blocked when firstWeek bossIntensity is hidden", () => {
    const fw = makeFirstWeek({
      bossIntensity: "hidden",
      allowedHomeSurfaces: ["coach_presence_line", "start_session"],
      currentDayStage: "DAY_3_COMPANION_CONNECTION",
    });
    const model = buildHomeExperienceModel({
      explicitMotivationStyle: "game_like",
      totalCompletedSessions: 3,
      resolvedExperience: undefined,
      firstWeekExperience: fw,
    });
    expect(model.rpgBossPlacement).toBe(
      "Boss surface blocked during first-week phase.",
    );
  });

  it("Premium prelude hidden before value — unlocks tease when premium triggers", () => {
    const fw = makeFirstWeek({
      premiumMoment: "none",
      unlockTease: null,
      currentDayStage: "DAY_3_COMPANION_CONNECTION",
      allowedHomeSurfaces: [
        "coach_presence_line",
        "start_session",
        "progress_proof",
        "companion_continuity",
      ],
    });
    const model = buildHomeExperienceModel({
      explicitMotivationStyle: "study_focused",
      totalCompletedSessions: 3,
      resolvedExperience: undefined,
      firstWeekExperience: fw,
    });
    expect(model.teasedElements[0]?.copy).toContain("personal value");

    const fw2 = makeFirstWeek({
      premiumMoment: "soft_tease",
      unlockTease: null,
      currentDayStage: "DAY_5_PATH_FORMING",
      allowedHomeSurfaces: [
        "coach_presence_line",
        "start_session",
        "study_deep_work_path",
      ],
      studyLayerLabel: "Study OS" as const,
    });
    const model2 = buildHomeExperienceModel({
      explicitMotivationStyle: "study_focused",
      totalCompletedSessions: 5,
      resolvedExperience: undefined,
      firstWeekExperience: fw2,
    });
    expect(model2.teasedElements[0]?.copy).toContain("personal value");
  });
});
