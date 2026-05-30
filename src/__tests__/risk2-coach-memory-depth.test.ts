import { experience } from "./product-journey-debloat-personalization-helpers";

describe("Risk 2 — Coach memory depth", () => {
  it("day 0 coach profile does not fabricate memory", () => {
    const exp = experience("coach_led");

    expect(exp.behaviorAdaptations).toContain("needs_more_signal");
    expect(exp.sessionDefaults.copy).toContain("default");
    expect(exp.sessionDefaults.duration).toBe(25);
    expect(exp.progressEmphasis).toBe("basic");
    expect(exp.userStage).toBe("new_user");
    expect(exp.homeSpotlight).toBe("none");
  });

  it("after session 1 coach still has limited signal, no fabricated memory", () => {
    const exp = experience("coach_led", {
      completedSessionDurations: [25],
      totalCompletedSessions: 1,
    });

    expect(exp.behaviorAdaptations).toContain("needs_more_signal");
    expect(exp.sessionDefaults.copy).toContain("default");
  });

  it("after 3+ sessions coach adapts to real data", () => {
    const exp = experience("coach_led", {
      completedSessionDurations: [25, 25, 30],
      totalCompletedSessions: 3,
      mostSuccessfulTimeOfDay: "morning",
    });

    expect(exp.behaviorAdaptations).toContain("duration_pattern");
    expect(exp.behaviorAdaptations).toContain("time_of_day_pattern");
    expect(exp.sessionDefaults.copy).toContain("best rhythm");
  });

  it("coach copy adapts per motivation style", () => {
    const studyExp = experience("study_focused", {
      completedSessionDurations: [30, 30, 45],
      studyUsageRatio: 0.7,
      totalCompletedSessions: 5,
    });
    expect(studyExp.coachMessageStyle).toBe("study_guide");

    const intenseExp = experience("intense", {
      completedSessionDurations: [15, 15, 10],
      totalCompletedSessions: 3,
    });
    expect(intenseExp.coachTone).toBe("direct");
    expect(intenseExp.coachMessageStyle).toBe("direct_tactical");

    const gameExp = experience("game_like");
    expect(gameExp.coachMessageStyle).toBe("game_companion");

    const calmExp = experience("calm");
    expect(calmExp.coachMessageStyle).toBe("reflective_prompt");
  });
});
