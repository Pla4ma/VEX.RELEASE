import { resolveVexExperience } from "../service";
import { available, profile, stats } from "./test-fixtures";

describe("resolveVexExperience — boss & home", () => {
  it("shows a calm user the subtle boss version without battle language", () => {
    const experience = resolveVexExperience(
      profile("calm"),
      stats({
        totalCompletedSessions: 5,
      }),
      available,
    );

    expect(experience.boss.intensity).toBe("subtle");
    expect(experience.boss.isVisible).toBe(false);
    expect(experience.boss.homePlacement).toBe("hidden");
    expect(experience.boss.copy).toContain("rhythm");
    expect(experience.boss.copy).not.toMatch(/battle|damage|kill|defeat/i);
    expect(experience.home.sections).not.toContain("boss_full_cta");
  });

  it("shows a game-like user stronger boss progress tied to sessions", () => {
    const experience = resolveVexExperience(
      profile("game_like"),
      stats({
        bossChallengeEngagement: "high",
        completedSessionDurations: [25, 30, 25],
        totalCompletedSessions: 8,
      }),
      available,
    );

    expect(experience.boss.intensity).toBe("game-like");
    expect(experience.boss.progressSource).toBe("completed_focus_sessions");
    expect(experience.boss.completionEffect).toBe("session_damage");
    expect(experience.hiddenSystems).toEqual(
      expect.arrayContaining([
        "shop",
        "inventory",
        "battle_pass",
        "wagers",
      ]),
    );
    expect(experience.home.sections).toContain("boss_compact");
  });

  it("does not query or navigate boss routes when boss is unavailable", () => {
    const experience = resolveVexExperience(
      profile("game_like"),
      stats({
        totalCompletedSessions: 12,
      }),
      { boss: false, challenges: false, study: false, premium: false },
    );

    expect(experience.routeGates.boss.canQuery).toBe(false);
    expect(experience.routeGates.boss.canNavigate).toBe(false);
    expect(experience.boss.isVisible).toBe(false);
    expect(experience.home.sections).not.toContain("boss_compact");
  });

  it("keeps boss off day zero except an optional tiny teaser", () => {
    const experience = resolveVexExperience(
      profile("game_like"),
      stats(),
      available,
    );

    expect(experience.boss.isVisible).toBe(false);
    expect(experience.boss.dayZeroTeaserAllowed).toBe(false);
    expect(experience.routeGates.boss.canQuery).toBe(false);
    expect(experience.routeGates.boss.canNavigate).toBe(false);
  });

  it("orders completion as core, coach, progress, contextual systems, next action", () => {
    const experience = resolveVexExperience(
      profile("study_focused"),
      stats({
        completedSessionDurations: [25, 25, 45],
        studyUsageRatio: 0.7,
        totalCompletedSessions: 6,
      }),
      available,
    );

    expect(experience.completion.sequence).toEqual([
      "core_saved",
      "coach_companion_reflection",
      "streak_progress",
      "study_progress",
      "quiet_xp",
      "next_action",
    ]);
  });
});
