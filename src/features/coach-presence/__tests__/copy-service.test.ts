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

describe("getCoachPresenceMessage", () => {
  it("calm tone", () => {
    const result = getCoachPresenceMessage(
      makeContext({ motivationStyle: "CALM" }),
    );
    expect(result.tone).toBe("calm");
    expect(result.visualMood).toBe("steady");
    expect(result.safeIntent).toBe("START_SESSION");
    expect(result.message.length).toBeLessThanOrEqual(96);
  });

  it("study tone", () => {
    const result = getCoachPresenceMessage(
      makeContext({
        motivationStyle: "STUDY_FOCUSED",
        primaryGoal: "study",
        studyLayerLabel: "Study OS",
        memoryConfidence: "weak",
        latestSession: {
          durationMinutes: 22,
          focusPurityScore: 81,
          isComeback: false,
          mode: "STUDY",
        },
      }),
    );
    expect(result.tone).toBe("studious");
    expect(result.safeIntent).toBe("START_STUDY_SESSION");
    expect(result.optionalActionLabel).toBe("Next study block");
    expect(result.message.length).toBeLessThanOrEqual(96);
  });

  it("game-like tone", () => {
    const result = getCoachPresenceMessage(
      makeContext({
        motivationStyle: "GAME_LIKE",
        bossIntensity: "game-like",
      }),
    );
    expect(result.tone).toBe("playful");
    expect(result.visualMood).toBe("celebrating");
    expect(result.message).not.toMatch(/Great job|Keep going|You can do it/i);
  });

  it("coach-led tone", () => {
    const result = getCoachPresenceMessage(
      makeContext({
        motivationStyle: "COACH_LED",
        memoryConfidence: "weak",
        latestSession: {
          durationMinutes: 18,
          focusPurityScore: 78,
          isComeback: false,
          mode: "FOCUS",
        },
      }),
    );
    expect(result.tone).toBe("direct");
    expect(result.visualMood).toBe("ready");
    expect(result.safeIntent).toBe("START_SESSION");
    expect(result.message.length).toBeLessThanOrEqual(96);
  });

  it("comeback tone", () => {
    const result = getCoachPresenceMessage(
      makeContext({
        motivationStyle: "CALM",
        comebackState: "missed_week",
      }),
    );
    expect(result.message).toContain("behind");
    expect(result.message).not.toMatch(/failed|lost/i);
    expect(result.message.length).toBeLessThanOrEqual(96);
    expect(result.safeIntent).toBe("START_SESSION");
    expect(result.optionalActionLabel).toBe("Start small");
  });

  it("completion tone — first session", () => {
    const result = getCoachPresenceMessage(
      makeContext({
        motivationStyle: "FRIENDLY",
        completionContext: "first_session",
      }),
    );
    expect(result.tone).toBe("warm");
    expect(result.safeIntent).toBe("START_SESSION");
    expect(result.message).not.toMatch(/Great job|Keep going/i);
  });

  it("completion tone — comeback", () => {
    const result = getCoachPresenceMessage(
      makeContext({
        motivationStyle: "COACH_LED",
        completionContext: "comeback",
      }),
    );
    expect(result.tone).toBe("direct");
    expect(result.safeIntent).toBe("START_SESSION");
  });

  it("completion tone — study", () => {
    const result = getCoachPresenceMessage(
      makeContext({
        motivationStyle: "STUDY_FOCUSED",
        primaryGoal: "study",
        completionContext: "study",
      }),
    );
    expect(result.safeIntent).toBe("START_STUDY_SESSION");
    expect(result.message.length).toBeLessThanOrEqual(96);
  });

  it("AI unavailable fallback", () => {
    const result = getCoachPresenceMessage(
      makeContext({
        motivationStyle: "FRIENDLY",
        aiAvailable: false,
      }),
    );
    expect(result.message).toBeTruthy();
    expect(result.message.length).toBeLessThanOrEqual(96);
    expect(result.message).not.toMatch(/error|failed|unavailable/i);
  });

  it("premium moment soft tease", () => {
    const result = getCoachPresenceMessage(
      makeContext({
        motivationStyle: "COACH_LED",
        memoryConfidence: "strong",
        premiumMoment: "soft_tease",
      }),
    );
    expect(result.message).toContain("Pro");
  });

  it("no raw route names in messages", () => {
    const result = getCoachPresenceMessage(
      makeContext({
        motivationStyle: "GAME_LIKE",
        completionContext: "normal",
      }),
    );
    expect(result.message).not.toMatch(/route|screen|navigate|tab|stack/i);
  });

  it("no heavy boss language for calm users", () => {
    const result = getCoachPresenceMessage(
      makeContext({
        motivationStyle: "CALM",
        bossIntensity: "game-like",
      }),
    );
    expect(result.message).not.toMatch(/damage|destroy|crush|defeat|beat/i);
  });

  it("short and human — under 96 chars", () => {
    const styles = [
      "CALM",
      "FRIENDLY",
      "COACH_LED",
      "GAME_LIKE",
      "INTENSE",
      "STUDY_FOCUSED",
    ] as const;
    for (const style of styles) {
      const result = getCoachPresenceMessage(
        makeContext({ motivationStyle: style }),
      );
      expect(result.message.length).toBeLessThanOrEqual(96);
    }
  });

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
