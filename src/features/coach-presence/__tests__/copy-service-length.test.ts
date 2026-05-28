import { getCoachPresenceMessage } from "../copy-service";
import type { CoachPresenceContext } from "../copy-service";

function makeContext(
  overrides: Partial<CoachPresenceContext> = {},
): CoachPresenceContext {
  return {
    motivationStyle: "CALM",
    primaryGoal: "focus",
    firstWeekStage: null,
    latestSession: null,
    memoryConfidence: "none",
    sessionMode: "inactive",
    comebackState: null,
    studyLayerLabel: null,
    bossIntensity: null,
    completionContext: null,
    premiumMoment: null,
    aiAvailable: true,
    ...overrides,
  };
}

describe("getCoachPresenceMessage — length and tone", () => {
  it("intense tone", () => {
    const result = getCoachPresenceMessage(
      makeContext({
        motivationStyle: "INTENSE",
        completionContext: "long",
      }),
    );
    expect(result.tone).toBe("sharp");
    expect(result.visualMood).toBe("ready");
    expect(result.message.length).toBeLessThanOrEqual(96);
  });
});
