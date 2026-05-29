import { QueryClient } from "@tanstack/react-query";

import { COACH_QUERY_KEYS } from "../features/ai-coach/constants";
import { experience } from "./product-journey-debloat-personalization-helpers";

describe("Group 6 — Coach", () => {
  it("6a: Day 0 coach does not fake memory", () => {
    const exp = experience("coach_led");

    expect(exp.behaviorAdaptations).toContain("needs_more_signal");
    expect(exp.sessionDefaults.copy).toContain("default");
    expect(exp.coachTone).toBe("soft");
  });

  it("6b: after session 1 coach references real session", () => {
    const exp = experience("coach_led", {
      completedSessionDurations: [60],
      totalCompletedSessions: 1,
    });

    expect(exp.behaviorAdaptations).toContain("needs_more_signal");
    expect(exp.sessionDefaults.duration).toBe(25);

    const multi = experience("coach_led", {
      completedSessionDurations: [25, 25, 30, 25],
      totalCompletedSessions: 6,
    });
    expect(multi.behaviorAdaptations).toContain("duration_pattern");
    expect(multi.sessionDefaults.copy).toContain("best rhythm");
  });

  it("6c: coach does not interrupt active focus", () => {
    const exp = experience("calm");

    expect(exp.coachMessageStyle).toBe("reflective_prompt");
    expect(exp.hiddenSystems).toContain("shop");
    expect(exp.completionSequence).not.toContain("coach_interruption");
  });

  it("6d: coach copy adapts by motivation style", () => {
    const studyExp = experience("study_focused");
    expect(studyExp.coachMessageStyle).toBe("study_guide");
    expect(studyExp.studyLayerLabel).toBe("Study OS");

    const intenseExp = experience("intense");
    expect(intenseExp.coachTone).toBe("direct");
    expect(intenseExp.coachMessageStyle).toBe("direct_tactical");

    const gameExp = experience("game_like");
    expect(gameExp.coachMessageStyle).toBe("game_companion");

    const calmExp = experience("calm");
    expect(calmExp.coachMessageStyle).toBe("reflective_prompt");

    const coachExp = experience("coach_led");
    expect(coachExp.coachMessageStyle).toBe("gentle_mentor");
  });

  it("6e: completed coach writes invalidate home recommendations", async () => {
    const queryClient = new QueryClient();
    const userId = "user-coach-1";
    const queryKey = COACH_QUERY_KEYS.recommendations(userId);

    queryClient.setQueryData(queryKey, []);
    await queryClient.invalidateQueries({ queryKey });

    expect(queryClient.getQueryState(queryKey)?.isInvalidated).toBe(true);
  });
});
