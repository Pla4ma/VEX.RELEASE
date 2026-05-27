import { buildActiveIntervention } from "../active-intervention";
import type {
  BehaviorProfile,
  BehaviorSignal,
  CoachMessage,
  CoachState,
  CoachUserState,
  SignalType,
} from "../schemas";

const USER_ID = "11111111-1111-4111-8111-111111111111";
const PERSONA_ID = "22222222-2222-4222-8222-222222222222";

function makeSignal(signalType: SignalType, value: number): BehaviorSignal {
  return {
    id: `44444444-4444-4444-8444-${Math.abs(value).toString().padStart(12, "0")}`,
    userId: USER_ID,
    signalType,
    value,
    confidence: 1,
    timestamp: Date.now(),
    metadata: {},
    expiresAt: Date.now() + 60_000,
  };
}

function makeProfile(signals: BehaviorSignal[] = []): BehaviorProfile {
  return {
    userId: USER_ID,
    signals,
    lastUpdated: Date.now(),
    confidenceLevel: "HIGH",
    coldStart: false,
    dataPoints: signals.length,
  };
}

function makeState(currentState: CoachUserState): CoachState {
  return {
    userId: USER_ID,
    currentState,
    previousState: null,
    stateEnteredAt: Date.now(),
    personaId: PERSONA_ID,
    behaviorProfile: null,
    lastInterventionAt: null,
    interventionsToday: 0,
    muteUntil: null,
    reduceNotifications: false,
  };
}

function makeBossMessage(): CoachMessage {
  return {
    id: "33333333-3333-4333-8333-333333333333",
    userId: USER_ID,
    personaId: PERSONA_ID,
    category: "CHALLENGE_PROMPT",
    content: "The boss is nearly defeated.",
    deliveryMethod: "IN_APP",
    priority: 8,
    status: "SENT",
    createdAt: Date.now(),
    scheduledFor: null,
    deliveredAt: null,
    readAt: null,
    dismissedAt: null,
    actionTaken: null,
    actionTakenAt: null,
  };
}

describe("buildActiveIntervention", () => {
  it("returns null when userId is missing", () => {
    const result = buildActiveIntervention({
      userId: undefined,
      state: makeState("HIGH_CONFIDENCE"),
      profile: makeProfile(),
      messages: [],
    });

    expect(result).toBeNull();
  });

  it("returns STREAK_RISK before lower priority conditions", () => {
    const result = buildActiveIntervention({
      userId: USER_ID,
      state: makeState("STREAK_AT_RISK"),
      profile: makeProfile([
        makeSignal("SESSION_FREQUENCY", 8),
        makeSignal("SESSION_QUALITY_TREND", 40),
      ]),
      messages: [makeBossMessage()],
    });

    expect(result?.type).toBe("STREAK_RISK");
    expect(result?.metadata.suggestedDuration).toBe(15 * 60);
  });

  it("returns BURNOUT for high frequency and low quality", () => {
    const result = buildActiveIntervention({
      userId: USER_ID,
      state: makeState("HIGH_CONFIDENCE"),
      profile: makeProfile([
        makeSignal("SESSION_FREQUENCY", 5),
        makeSignal("SESSION_QUALITY_TREND", 60),
      ]),
      messages: [],
    });

    expect(result?.type).toBe("BURNOUT");
  });

  it("returns BOSS_FINISH when a boss challenge prompt is active", () => {
    const result = buildActiveIntervention({
      userId: USER_ID,
      state: makeState("HIGH_CONFIDENCE"),
      profile: makeProfile(),
      messages: [makeBossMessage()],
    });

    expect(result?.type).toBe("BOSS_FINISH");
    expect(result?.metadata.suggestedMode).toBe("DEEP_WORK");
  });

  it("returns PLATEAU for low confidence coach state", () => {
    const result = buildActiveIntervention({
      userId: USER_ID,
      state: makeState("LOW_CONFIDENCE"),
      profile: makeProfile(),
      messages: [],
    });

    expect(result?.type).toBe("PLATEAU");
  });

  it("returns PLATEAU when consistency signal drops sharply", () => {
    const result = buildActiveIntervention({
      userId: USER_ID,
      state: makeState("HIGH_CONFIDENCE"),
      profile: makeProfile([makeSignal("CONSISTENCY_SCORE", -40)]),
      messages: [],
    });

    expect(result?.type).toBe("PLATEAU");
  });

  it("returns null when no intervention is warranted", () => {
    const result = buildActiveIntervention({
      userId: USER_ID,
      state: makeState("HIGH_CONFIDENCE"),
      profile: makeProfile([
        makeSignal("SESSION_FREQUENCY", 1),
        makeSignal("SESSION_QUALITY_TREND", 95),
      ]),
      messages: [],
    });

    expect(result).toBeNull();
  });

  it("does not interrupt active calm focus", () => {
    const result = buildActiveIntervention({
      userId: USER_ID,
      state: makeState("STREAK_AT_RISK"),
      profile: makeProfile([makeSignal("LAST_SESSION_HOURS", 47)]),
      messages: [makeBossMessage()],
      sessionMode: "active_focus",
      motivationStyle: "CALM",
    });

    expect(result).toBeNull();
  });
});
