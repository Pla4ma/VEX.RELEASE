/**
 * Cross-cutting tests: verifies lane resolution consistency
 * across all service functions.
 */

import { describe, it, expect } from "@jest/globals";

import {
  deriveHomeSurface,
  deriveQuickContract,
  deriveActiveIndicator,
  deriveRescueSurface,
} from "../service";
import {
  deriveCompletionSurface,
  deriveWeeklyIntelligence,
} from "../service-surface";
import type { Lane } from "../../lane-engine/types";

const ALL_LANES: Lane[] = ["student", "game_like", "deep_creative", "minimal_normal"];

// ═══════════════════════════════════════════════════════════════════════
// CROSS-CUTTING: lane resolution consistency
// ═══════════════════════════════════════════════════════════════════════

describe("lane resolution consistency across service functions", () => {
  it("all service functions resolve the same lane for valid input", () => {
    for (const lane of ALL_LANES) {
      expect(deriveHomeSurface({ laneOverride: lane }).lane).toBe(lane);
      expect(deriveQuickContract(lane).lane).toBe(lane);
      expect(deriveActiveIndicator(lane).lane).toBe(lane);
      expect(deriveRescueSurface(lane).lane).toBe(lane);
      expect(deriveCompletionSurface({ laneOverride: lane }).lane).toBe(lane);
      expect(deriveWeeklyIntelligence({ laneOverride: lane }).lane).toBe(lane);
    }
  });

  it("all service functions fall back to minimal_normal for null", () => {
    expect(deriveHomeSurface({ laneOverride: null }).lane).toBe("minimal_normal");
    expect(deriveQuickContract(null).lane).toBe("minimal_normal");
    expect(deriveActiveIndicator(null).lane).toBe("minimal_normal");
    expect(deriveRescueSurface(null).lane).toBe("minimal_normal");
    expect(deriveCompletionSurface({ laneOverride: null }).lane).toBe("minimal_normal");
    expect(deriveWeeklyIntelligence({ laneOverride: null }).lane).toBe("minimal_normal");
  });

  it("all service functions fall back to minimal_normal for undefined", () => {
    expect(deriveHomeSurface({}).lane).toBe("minimal_normal");
    expect(deriveQuickContract(undefined).lane).toBe("minimal_normal");
    expect(deriveActiveIndicator(undefined).lane).toBe("minimal_normal");
    expect(deriveRescueSurface(undefined).lane).toBe("minimal_normal");
    expect(deriveCompletionSurface({}).lane).toBe("minimal_normal");
    expect(deriveWeeklyIntelligence({}).lane).toBe("minimal_normal");
  });
});
