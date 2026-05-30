/**
 * Coach Presence — Copy Service Tests
 */

import { getCoachMemoryConfidence, getCoachPresenceMessage } from "../copy-service";

describe("getCoachMemoryConfidence", () => {
  test("returns none when sync is unavailable", () => {
    expect(getCoachMemoryConfidence(10, false)).toBe("none");
  });

  test("returns none for 0 sessions", () => {
    expect(getCoachMemoryConfidence(0, true)).toBe("none");
  });

  test("returns weak for 1-2 sessions", () => {
    expect(getCoachMemoryConfidence(1, true)).toBe("weak");
    expect(getCoachMemoryConfidence(2, true)).toBe("weak");
  });

  test("returns medium for 3-4 sessions", () => {
    expect(getCoachMemoryConfidence(3, true)).toBe("medium");
    expect(getCoachMemoryConfidence(4, true)).toBe("medium");
  });

  test("returns strong for 5+ sessions", () => {
    expect(getCoachMemoryConfidence(5, true)).toBe("strong");
    expect(getCoachMemoryConfidence(100, true)).toBe("strong");
  });
});

describe("getCoachPresenceMessage (copy-service)", () => {
  test("returns message for day-0 user with CALM style", () => {
    const result = getCoachPresenceMessage({
      motivationStyle: "CALM",
      primaryGoal: "focus",
      firstWeekStage: "day_0",
      latestSession: null,
      memoryConfidence: "none",
      sessionMode: "inactive",
      comebackState: null,
      studyLayerLabel: null,
      bossIntensity: null,
      completionContext: null,
      premiumMoment: null,
      aiAvailable: true,
    });
    expect(result.message).toBeTruthy();
    expect(result.tone).toBe("calm");
    expect(result.safeIntent).toBe("START_SESSION");
  });

  test("returns TAKE_BREAK intent for low_energy completion", () => {
    const result = getCoachPresenceMessage({
      motivationStyle: "CALM",
      primaryGoal: "focus",
      firstWeekStage: null,
      latestSession: null,
      memoryConfidence: "none",
      sessionMode: "inactive",
      comebackState: null,
      studyLayerLabel: null,
      bossIntensity: null,
      completionContext: "low_energy",
      premiumMoment: null,
      aiAvailable: true,
    });
    expect(result.safeIntent).toBe("TAKE_BREAK");
  });

  test("returns START_STUDY_SESSION intent for study goal", () => {
    const result = getCoachPresenceMessage({
      motivationStyle: "STUDY_FOCUSED",
      primaryGoal: "study",
      firstWeekStage: null,
      latestSession: null,
      memoryConfidence: "none",
      sessionMode: "inactive",
      comebackState: null,
      studyLayerLabel: "Study",
      bossIntensity: null,
      completionContext: null,
      premiumMoment: null,
      aiAvailable: true,
    });
    expect(result.safeIntent).toBe("START_STUDY_SESSION");
  });

  test("returns intervention display mode for active_risk", () => {
    const result = getCoachPresenceMessage({
      motivationStyle: "CALM",
      primaryGoal: "focus",
      firstWeekStage: null,
      latestSession: null,
      memoryConfidence: "medium",
      sessionMode: "active_risk",
      comebackState: null,
      studyLayerLabel: null,
      bossIntensity: null,
      completionContext: null,
      premiumMoment: null,
      aiAvailable: true,
    });
    expect(result.displayMode).toBe("intervention");
  });

  test("returns quiet display mode for active_focus with CALM style", () => {
    const result = getCoachPresenceMessage({
      motivationStyle: "CALM",
      primaryGoal: "focus",
      firstWeekStage: null,
      latestSession: null,
      memoryConfidence: "strong",
      sessionMode: "active_focus",
      comebackState: null,
      studyLayerLabel: null,
      bossIntensity: null,
      completionContext: null,
      premiumMoment: null,
      aiAvailable: true,
    });
    expect(result.displayMode).toBe("quiet");
    expect(result.shouldShow).toBe(false);
  });
});
