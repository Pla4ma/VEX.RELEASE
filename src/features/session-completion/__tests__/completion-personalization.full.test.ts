import { SessionMode } from "../../../session/modes";
import { createSessionSummary } from "./ledger-test-utils";
import {
  LANES,
  CLEAN_REFLECTIONS,
  UNLOCK_KEYS,
  buildResult,
} from "./completion-personalization.helpers";

describe("Phase 5 - Completion Personalization > Full completion per lane", () => {
  it.each(LANES)("%s: produces all 7 canonical fields", (lane) => {
    const result = buildResult(lane);
    expect(result.laneProfile).toBeDefined();
    expect(result.progressProof).toBeDefined();
    expect(result.reflectionQuestion).toBeDefined();
    expect(result.reflectionQuestion.length).toBeGreaterThan(0);
    expect(result.memoryCandidates).toBeDefined();
    expect(result.unlockDecision).toBeDefined();
    expect(result.userFacingSummary).toBeDefined();
  });

  it.each(LANES)("%s: clean reflection question matches", (lane) => {
    const result = buildResult(lane);
    expect(result.reflectionQuestion).toBe(CLEAN_REFLECTIONS[lane]);
  });

  it.each(LANES)("%s: unlock key matches lane surface", (lane) => {
    const result = buildResult(lane);
    expect(result.unlockDecision.key).toBe(UNLOCK_KEYS[lane]);
  });

  it.each(LANES)("%s: memory candidate generated with evidence", (lane) => {
    const result = buildResult(lane);
    expect(result.memoryCandidates.length).toBe(1);
    expect(result.memoryCandidates[0].text).toContain(
      "s:" + createSessionSummary().sessionId.split("-")[0],
    );
  });
});

describe("Phase 5 - Completion Personalization > First session creates return plan", () => {
  it.each(LANES)("%s: progressProof shows xpDelta and completion", (lane) => {
    const result = buildResult(lane, { xpDelta: 80 });
    expect(result.progressProof.xpDelta).toBe(80);
    expect(result.progressProof.effectiveMinutes).toBeGreaterThan(0);
    expect(result.progressProof.completionPercentage).toBe(100);
  });
});

describe("Phase 5 - Completion Personalization > User-facing summary is lane-appropriate", () => {
  it.each(LANES)(
    "%s: has displayTitle, displayBody, nextActionLabel",
    (lane) => {
      const result = buildResult(lane);
      expect(result.userFacingSummary.displayTitle.length).toBeGreaterThan(0);
      expect(result.userFacingSummary.displayBody.length).toBeGreaterThan(0);
      expect(result.userFacingSummary.nextActionLabel.length).toBeGreaterThan(
        0,
      );
    },
  );
});
