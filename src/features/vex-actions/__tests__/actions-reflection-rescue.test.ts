import { describe, expect, it } from "@jest/globals";
import { vexCompleteReflection, vexStartRescue } from "../service";
import {
  GATE_OPEN,
  GATE_CLOSED,
  validStartRescue,
  validCompleteReflection,
  expectData,
} from "./actions-helpers";

describe("VexAction Boundaries", () => {
  describe("complete_reflection", () => {
    it("returns success with valid input", () => {
      const result = vexCompleteReflection(validCompleteReflection, GATE_OPEN);
      expect(result.status).toBe("success");
      expect(result.data).toHaveProperty("reflectionQuestion");
      expect(expectData(result.data, "reflectionQuestion")).toBeTruthy();
    });

    it("fails validation with invalid summary shape", () => {
      const result = vexCompleteReflection(
        { ...validCompleteReflection, summary: { bad: "shape" } },
        GATE_OPEN,
      );
      expect(result.status).toBe("validation_error");
    });

    it("is blocked when gate is closed", () => {
      const result = vexCompleteReflection(
        validCompleteReflection,
        GATE_CLOSED,
      );
      expect(result.status).toBe("feature_blocked");
    });

    it("does not expose hidden feature keys in output", () => {
      const result = vexCompleteReflection(
        { ...validCompleteReflection, lane: "game_like" },
        GATE_OPEN,
      );
      const unlock = expectData(result.data, "unlockDecision");
      expect(unlock).toBeTruthy();
      expect((unlock as Record<string, unknown>).status).not.toBe("available");
    });
  });

  describe("start_rescue", () => {
    it("returns success with valid input", () => {
      const result = vexStartRescue(validStartRescue, GATE_OPEN);
      expect(result.status).toBe("success");
      expect(result.data).toHaveProperty("lane", "student");
      expect(result.data).toHaveProperty("reason", "unclear");
      expect(expectData(result.data, "durationSeconds")).toBeGreaterThanOrEqual(
        5 * 60,
      );
      expect(expectData(result.data, "durationSeconds")).toBeLessThanOrEqual(
        12 * 60,
      );
    });

    it("fails validation on bad reason", () => {
      const result = vexStartRescue(
        { ...validStartRescue, reason: "not_a_reason" },
        GATE_OPEN,
      );
      expect(result.status).toBe("validation_error");
    });

    it("respects duration clamping (5-12 min max range)", () => {
      const tooShort = vexStartRescue(
        { ...validStartRescue, durationSeconds: 60 },
        GATE_OPEN,
      );
      expect(
        expectData(tooShort.data, "durationSeconds"),
      ).toBeGreaterThanOrEqual(5 * 60);
    });

    it("is blocked when gate is closed", () => {
      const result = vexStartRescue(validStartRescue, GATE_CLOSED);
      expect(result.status).toBe("feature_blocked");
    });
  });
});
