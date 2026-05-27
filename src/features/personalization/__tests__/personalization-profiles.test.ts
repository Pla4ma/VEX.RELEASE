import { describe, it, expect } from "@jest/globals";
import {
  resolveVexExperience,
  makeProfile,
  makeStats,
  defaultAvailability,
} from "./personalization.helpers";

describe("Calm work user", () => {
  it("gets soft tone and minimal gamification", () => {
    const profile = makeProfile({
      primaryGoal: "work",
      motivationStyle: "calm",
      preferredTone: "soft",
      gamificationIntensity: "minimal",
    });
    const result = resolveVexExperience(
      profile,
      makeStats(),
      defaultAvailability,
    );
    expect(result.coachTone).toBe("soft");
    expect(result.bossIntensity).toBe("subtle");
  });

  it("gets compact_starter layout at 0 sessions", () => {
    const profile = makeProfile({ motivationStyle: "calm" });
    const result = resolveVexExperience(
      profile,
      makeStats({ totalCompletedSessions: 0 }),
      defaultAvailability,
    );
    expect(result.homeLayoutVariant).toBe("compact_starter");
    expect(result.userStage).toBe("new_user");
    expect(result.primaryHomeCTA.intent).toBe("START_SESSION");
    expect(result.homeSpotlight).toBe("none");
  });
});

describe("Study-focused student", () => {
  it("gets study_centered layout", () => {
    const profile = makeProfile({
      primaryGoal: "study",
      motivationStyle: "study_focused",
      preferredTone: "strategic",
      gamificationIntensity: "minimal",
      coachMode: "study_tutor",
      studyLayerName: "Study OS",
    });
    const result = resolveVexExperience(
      profile,
      makeStats({ totalCompletedSessions: 3, studyUsageRatio: 0.6 }),
      { boss: true, challenges: true, premium: false, study: true },
    );
    expect(result.homeLayoutVariant).toBe("study_centered");
    expect(result.studyLayerLabel).toBe("Study OS");
    expect(result.studyLayerProminence).toBe("spotlight");
    expect(result.allowedRoutes).toContain("SessionStack.SessionSetup");
    expect(result.allowedRoutes).not.toContain("Guild");
  });

  it("home sections include study_layer", () => {
    const profile = makeProfile({
      primaryGoal: "study",
      motivationStyle: "study_focused",
    });
    const result = resolveVexExperience(
      profile,
      makeStats({ totalCompletedSessions: 3, studyUsageRatio: 0.5 }),
      { boss: true, challenges: true, premium: false, study: true },
    );
    expect(result.home.sections).toContain("study_layer");
  });
});

describe("Game-like user", () => {
  it("gets game_centered layout and game-like boss", () => {
    const profile = makeProfile({
      motivationStyle: "game_like",
      gamificationIntensity: "strong",
      coachMode: "game_guide",
    });
    const result = resolveVexExperience(
      profile,
      makeStats({ totalCompletedSessions: 5 }),
      { boss: true, challenges: true, premium: false, study: false },
    );
    expect(result.bossIntensity).toBe("game-like");
    expect(result.homeLayoutVariant).toBe("game_centered");
  });

  it("boss is visible and has session_damage effect", () => {
    const profile = makeProfile({ motivationStyle: "game_like" });
    const result = resolveVexExperience(
      profile,
      makeStats({ totalCompletedSessions: 5 }),
      { boss: true, challenges: true, premium: false, study: false },
    );
    expect(result.boss.isVisible).toBe(true);
    expect(result.boss.completionEffect).toBe("session_damage");
  });
});
