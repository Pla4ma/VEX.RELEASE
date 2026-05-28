import { buildHomeExperienceModel, getHomeStage } from "../service";

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
