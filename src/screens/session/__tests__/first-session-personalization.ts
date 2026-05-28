import { describe, it, expect } from "@jest/globals";
import { computePersonalization } from "./first-session-helpers";

describe("FirstSessionPersonalization - pure logic", () => {
  it("returns default Focus mode when no onboarding data", () => {
    const result = computePersonalization({
      goal: null,
      focusDuration: null,
      element: null,
      motivationProfile: null,
    });
    expect(result.defaultMode).toBe("LIGHT_FOCUS");
    expect(result.suggestedDurationMinutes).toBe(20);
    expect(result.companionElement).toBeNull();
    expect(result.showBossTease).toBe(false);
  });

  it("Study user gets Study default mode", () => {
    const result = computePersonalization({
      goal: "STUDY",
      focusDuration: null,
      element: null,
      motivationProfile: null,
    });
    expect(result.defaultMode).toBe("STUDY");
  });

  it("Work user gets Focus default mode", () => {
    const result = computePersonalization({
      goal: "WORK",
      focusDuration: null,
      element: null,
      motivationProfile: null,
    });
    expect(result.defaultMode).toBe("LIGHT_FOCUS");
  });

  it("Custom duration stored in onboarding is respected", () => {
    const result = computePersonalization({
      goal: "STUDY",
      focusDuration: 45,
      element: null,
      motivationProfile: null,
    });
    expect(result.suggestedDurationMinutes).toBe(45);
    expect(result.defaultMode).toBe("STUDY");
  });

  it("Creative goal maps to Creator mode", () => {
    const result = computePersonalization({
      goal: "CREATIVE",
      focusDuration: null,
      element: null,
      motivationProfile: null,
    });
    expect(result.defaultMode).toBe("CREATIVE");
  });

  it("Personal goal maps to calm with gentle duration and duration label", () => {
    const result = computePersonalization({
      goal: "PERSONAL",
      focusDuration: null,
      element: null,
      motivationProfile: null,
    });
    expect(result.suggestedDurationMinutes).toBe(15);
    expect(result.showBossTease).toBe(false);
    expect(result.durationLabel).toContain("gentle");
  });

  it("Calm user has no boss tease", () => {
    const result = computePersonalization({
      goal: "PERSONAL",
      focusDuration: null,
      element: null,
      motivationProfile: null,
    });
    expect(result.showBossTease).toBe(false);
    expect(result.coachLine).not.toContain("boss");
  });

  it("Game-like profile shows boss tease coach line and shorter duration", () => {
    const result = computePersonalization({
      goal: null,
      focusDuration: null,
      element: null,
      motivationProfile: { primary: "game_like", secondary: [] },
    });
    expect(result.defaultMode).toBe("LIGHT_FOCUS");
    expect(result.showBossTease).toBe(true);
    expect(result.coachLine).toContain("boss");
    expect(result.suggestedDurationMinutes).toBe(15);
    expect(result.durationLabel).toContain("boss");
  });

  it("Intense profile gets Deep Work default with strong copy", () => {
    const result = computePersonalization({
      goal: null,
      focusDuration: null,
      element: null,
      motivationProfile: { primary: "intense", secondary: [] },
    });
    expect(result.defaultMode).toBe("DEEP_WORK");
    expect(result.coachLine).toContain("Set the tone");
    expect(result.suggestedDurationMinutes).toBe(25);
  });

  it("Competitive profile gets Deep Work default", () => {
    const result = computePersonalization({
      goal: null,
      focusDuration: null,
      element: null,
      motivationProfile: { primary: "competitive", secondary: [] },
    });
    expect(result.defaultMode).toBe("DEEP_WORK");
  });

  it("returns companion element when set in onboarding", () => {
    const result = computePersonalization({
      goal: null,
      focusDuration: null,
      element: "FLAME",
      motivationProfile: null,
    });
    expect(result.companionElement).toBe("FLAME");
  });

  it("null element returns null", () => {
    const result = computePersonalization({
      goal: null,
      focusDuration: null,
      element: null,
      motivationProfile: null,
    });
    expect(result.companionElement).toBeNull();
  });
});
