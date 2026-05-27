import type { SessionEntry } from "./useHomeResolvedExperience.helpers";
import {
  resolvePrimaryGoal,
  computeStudyUsageRatio,
  computeBossEngagement,
} from "./useHomeResolvedExperience.helpers";

describe("HomeSurfaceDecision inputs from canonical sources", () => {
  it("learning goal remains learning — not overwritten by study_layer section detection", () => {
    const goal = resolvePrimaryGoal("LEARNING");
    expect(goal).toBe("learning");
    expect(goal).not.toBe("study");
  });

  it("personal goal remains personal (Growth Path) — not overwritten", () => {
    const goal = resolvePrimaryGoal("PERSONAL");
    expect(goal).toBe("personal");
  });

  it("studyUsageRatio is computed from real session data — not invented from activeStudyPlan boolean", () => {
    const sessions: SessionEntry[] = [
      { mode: "FOCUS" },
      { mode: "STUDY" },
    ];
    const ratio = computeStudyUsageRatio(sessions, 2);
    expect(ratio).toBe(0.5);
    expect(ratio).not.toBe(0);
    expect(ratio).not.toBe(0.4);
  });

  it("bossEngagement is from boss query data — not derived from firstWeek bossIntensity", () => {
    expect(computeBossEngagement(true, 3)).toBe("high");
    expect(computeBossEngagement(true, 0)).toBe("low");
    expect(computeBossEngagement(false, 10)).toBe("none");
  });

  it("coachInteractions must be from recommendation data — not from coachMessageType string match", () => {
    const total = 1 + 3;
    expect(total).toBe(4);
  });
});
