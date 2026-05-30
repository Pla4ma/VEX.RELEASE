/**
 * Tests for session-start hero-builder.
 */

import { buildSessionStartHero } from "../hero-builder";

describe("session-start: hero-builder", () => {
  it("returns rescue hero when source is 'rescue'", () => {
    const hero = buildSessionStartHero({
      durationMinutes: 5,
      params: { source: "rescue" },
      presetName: "Quick",
      smartSuggestionDescription: null,
    });
    expect(hero.eyebrow).toBe("Rescue Block");
    expect(hero.title).toContain("5 minutes");
  });

  it("uses rescueTaskDescription when available", () => {
    const hero = buildSessionStartHero({
      durationMinutes: 5,
      params: { source: "rescue", rescueTaskDescription: "Just breathe." },
      presetName: "Quick",
      smartSuggestionDescription: null,
    });
    expect(hero.body).toBe("Just breathe.");
  });

  it("returns onboarding hero when source is 'onboarding_first_session'", () => {
    const hero = buildSessionStartHero({
      durationMinutes: 15,
      params: { source: "onboarding_first_session" },
      presetName: "Quick Focus",
      smartSuggestionDescription: null,
    });
    expect(hero.eyebrow).toBe("First Session");
    expect(hero.title).toContain("15 minutes");
  });

  it("returns content-study hero for 'content-study' source", () => {
    const hero = buildSessionStartHero({
      durationMinutes: 20,
      params: { source: "content-study" },
      presetName: "Deep",
      smartSuggestionDescription: null,
    });
    expect(hero.eyebrow).toBe("Deep Work Sprint");
    expect(hero.title).toContain("focused block");
  });

  it("returns learning-execution hero with custom label", () => {
    const hero = buildSessionStartHero({
      durationMinutes: 25,
      params: { source: "learning-execution", learningExecutionLabel: "Practice Lab" },
      presetName: "Study",
      smartSuggestionDescription: null,
    });
    expect(hero.eyebrow).toBe("Practice Lab");
  });

  it("returns comeback hero when comebackMultiplier > 1", () => {
    const hero = buildSessionStartHero({
      durationMinutes: 10,
      params: { comebackMultiplier: 2, comebackMessage: "Welcome back!" },
      presetName: "Focus",
      smartSuggestionDescription: null,
    });
    expect(hero.eyebrow).toBe("Comeback Session");
    expect(hero.title).toBe("Welcome back!");
  });

  it("returns recommendation hero when smartSuggestionDescription is provided", () => {
    const hero = buildSessionStartHero({
      durationMinutes: 25,
      params: {},
      presetName: "Pomodoro",
      smartSuggestionDescription: "Based on your recent sessions",
    });
    expect(hero.eyebrow).toBe("Recommended For Today");
    expect(hero.body).toBe("Based on your recent sessions");
  });

  it("returns default fast-start hero when no special conditions", () => {
    const hero = buildSessionStartHero({
      durationMinutes: 25,
      params: {},
      presetName: "Pomodoro",
      smartSuggestionDescription: null,
    });
    expect(hero.eyebrow).toBe("Fast Start");
    expect(hero.title).toContain("Pomodoro");
  });
});
