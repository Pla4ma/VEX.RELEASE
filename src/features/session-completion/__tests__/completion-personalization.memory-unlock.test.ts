import { SessionMode } from "../../../session/modes";
import {
  buildCompletionPersonalization,
  buildCompletionPersonalizationResult,
} from "../service";
import { createSessionSummary } from "./ledger-test-utils";
import {
  LANES,
  UNLOCK_KEYS,
  buildResult,
} from "./completion-personalization.helpers";

describe("Phase 5 - Completion Personalization > Memory candidate with evidence", () => {
  it("includes session ID in evidence text", () => {
    const result = buildResult("student");
    expect(result.memoryCandidates[0].text).toContain("s:");
    expect(result.memoryCandidates[0].source).toBe("session_completion");
  });

  it("reflects reflection answer when provided", () => {
    const result = buildCompletionPersonalizationResult({
      deletedMemoryIds: [],
      focusScoreDelta: 8,
      grade: "A",
      isPersonalBest: false,
      lane: "student",
      streakAction: "extended",
      streakDays: 4,
      summary: createSessionSummary({ sessionMode: SessionMode.STUDY }),
      xpDelta: 120,
      reflectionAnswer: "The structure helped me stay focused.",
    });
    expect(result.memoryCandidates[0].text).toContain(
      "The structure helped me stay focused.",
    );
  });
});

describe("Phase 5 - Completion Personalization > Deleted memory respected", () => {
  it("does not create memory candidate when in deleted list", () => {
    const summary = createSessionSummary({
      sessionMode: SessionMode.FLOW,
    });
    const result = buildCompletionPersonalization({
      deletedMemoryIds: [`${summary.sessionId}:minimal_normal:clean`],
      lane: "minimal_normal",
      summary,
    });
    expect(result.memoryCandidates).toEqual([]);
  });

  it("still produces other fields when memory deleted", () => {
    const summary = createSessionSummary({
      sessionMode: SessionMode.FLOW,
    });
    const result = buildCompletionPersonalization({
      deletedMemoryIds: [`${summary.sessionId}:minimal_normal:clean`],
      lane: "minimal_normal",
      summary,
    });
    expect(result.reflectionQuestion).toBeDefined();
    expect(result.unlockDecision).toBeDefined();
    expect(result.nextActionLabel).toBeDefined();
    expect(result.displayBody).toBeDefined();
  });
});

describe("Phase 5 - Completion Personalization > Unlock decision produced but hidden systems stay hidden", () => {
  const SUMMARY = createSessionSummary({ sessionMode: SessionMode.FLOW });

  it.each(LANES)(
    "%s: hidden unlock when featureKey in hidden list",
    (lane) => {
      const result = buildCompletionPersonalization({
        hiddenFeatureKeys: [UNLOCK_KEYS[lane]],
        lane,
        summary: SUMMARY,
      });
      expect(result.unlockDecision.hidden).toBe(true);
      expect(result.unlockDecision.status).toBe("blocked");
    },
  );

  it.each(LANES)(
    "%s: visible unlock when featureKey not in hidden list",
    (lane) => {
      const result = buildCompletionPersonalization({
        hiddenFeatureKeys: [],
        lane,
        summary: SUMMARY,
      });
      expect(result.unlockDecision.hidden).toBe(false);
      expect(result.unlockDecision.status).toBe("teased");
    },
  );
});

describe("Phase 5 - Completion Personalization > Next action safe if feature degraded", () => {
  it("produces result without crashing when nextAction is null", () => {
    const result = buildCompletionPersonalizationResult({
      deletedMemoryIds: [],
      focusScoreDelta: 8,
      grade: "A",
      isPersonalBest: false,
      lane: "student",
      streakAction: "extended",
      streakDays: 4,
      summary: createSessionSummary({ sessionMode: SessionMode.FLOW }),
      xpDelta: 120,
    });
    expect(result.nextAction).toBeNull();
    expect(result.progressProof.xpDelta).toBe(120);
    expect(result.userFacingSummary.displayTitle).toBeDefined();
  });
});
