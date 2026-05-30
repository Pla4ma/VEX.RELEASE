/**
 * Tests for copy integrity — ensures all copy objects have entries
 * for every lane, no banned language, and correct field values.
 */

import { describe, it, expect } from "@jest/globals";

import {
  HOME_COPY,
  QUICK_CONTRACT_COPY,
  ACTIVE_INDICATOR_COPY,
  COMPLETION_COPY,
  RESCUE_COPY,
  WEEKLY_INTELLIGENCE_COPY,
} from "../copy";
import type { Lane } from "../../lane-engine/types";

const ALL_LANES: Lane[] = ["student", "game_like", "deep_creative", "minimal_normal"];

// ═══════════════════════════════════════════════════════════════════════
// COPY INTEGRITY
// ═══════════════════════════════════════════════════════════════════════

describe("mode-native copy integrity", () => {
  it("HOME_COPY has an entry for every lane", () => {
    expect(Object.keys(HOME_COPY)).toHaveLength(4);
    for (const lane of ALL_LANES) {
      expect(HOME_COPY[lane]).toBeDefined();
    }
  });

  it("QUICK_CONTRACT_COPY has an entry for every lane", () => {
    expect(Object.keys(QUICK_CONTRACT_COPY)).toHaveLength(4);
    for (const lane of ALL_LANES) {
      expect(QUICK_CONTRACT_COPY[lane]).toBeDefined();
    }
  });

  it("ACTIVE_INDICATOR_COPY has an entry for every lane", () => {
    expect(Object.keys(ACTIVE_INDICATOR_COPY)).toHaveLength(4);
    for (const lane of ALL_LANES) {
      expect(ACTIVE_INDICATOR_COPY[lane]).toBeDefined();
    }
  });

  it("COMPLETION_COPY has an entry for every lane", () => {
    expect(Object.keys(COMPLETION_COPY)).toHaveLength(4);
    for (const lane of ALL_LANES) {
      expect(COMPLETION_COPY[lane]).toBeDefined();
    }
  });

  it("RESCUE_COPY has an entry for every lane", () => {
    expect(Object.keys(RESCUE_COPY)).toHaveLength(4);
    for (const lane of ALL_LANES) {
      expect(RESCUE_COPY[lane]).toBeDefined();
    }
  });

  it("WEEKLY_INTELLIGENCE_COPY has an entry for every lane", () => {
    expect(Object.keys(WEEKLY_INTELLIGENCE_COPY)).toHaveLength(4);
    for (const lane of ALL_LANES) {
      expect(WEEKLY_INTELLIGENCE_COPY[lane]).toBeDefined();
    }
  });

  it("no two HOME_COPY lanes share the same headline", () => {
    const headlines = Object.values(HOME_COPY).map((c) => c.headline);
    expect(new Set(headlines).size).toBe(headlines.length);
  });

  it("no two RESCUE_COPY lanes share the same headline", () => {
    const headlines = Object.values(RESCUE_COPY).map((c) => c.headline);
    expect(new Set(headlines).size).toBe(headlines.length);
  });

  it("no two COMPLETION_COPY lanes share the same headline", () => {
    const headlines = Object.values(COMPLETION_COPY).map((c) => c.headline);
    expect(new Set(headlines).size).toBe(headlines.length);
  });

  it("all RESCUE_COPY durations are within schema bounds (3–15 min)", () => {
    for (const lane of ALL_LANES) {
      const duration = RESCUE_COPY[lane].suggestedDurationMinutes;
      expect(duration).toBeGreaterThanOrEqual(3);
      expect(duration).toBeLessThanOrEqual(15);
    }
  });

  it("all HOME_COPY durations are within schema bounds (5–120 min)", () => {
    for (const lane of ALL_LANES) {
      const duration = HOME_COPY[lane].suggestedDurationMinutes;
      expect(duration).toBeGreaterThanOrEqual(5);
      expect(duration).toBeLessThanOrEqual(120);
    }
  });

  it("all QUICK_CONTRACT_COPY have at least 1 question", () => {
    for (const lane of ALL_LANES) {
      expect(QUICK_CONTRACT_COPY[lane].questions.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("no copy uses shame-based language", () => {
    const allCopy = JSON.stringify([
      HOME_COPY, QUICK_CONTRACT_COPY, ACTIVE_INDICATOR_COPY,
      COMPLETION_COPY, RESCUE_COPY, WEEKLY_INTELLIGENCE_COPY,
    ]);
    expect(allCopy).not.toMatch(/fail|missed|behind|should have|lazy|stupid/i);
  });

  it("no copy uses gamification reward language", () => {
    // Concatenate all text fields individually for precise matching
    const allTexts: string[] = [];
    for (const copyObj of [HOME_COPY, QUICK_CONTRACT_COPY, ACTIVE_INDICATOR_COPY, COMPLETION_COPY, RESCUE_COPY, WEEKLY_INTELLIGENCE_COPY]) {
      for (const entry of Object.values(copyObj)) {
        for (const value of Object.values(entry)) {
          if (typeof value === "string") allTexts.push(value);
        }
      }
    }
    const banned = /battle|coin|gem|reward.?chest|defeat|loot/i;
    // "boss" is allowed only in the anti-gamification phrase "No boss today"
    for (const text of allTexts) {
      expect(text).not.toMatch(banned);
      if (/\bboss\b/i.test(text)) {
        expect(text).toMatch(/no boss/i);
      }
    }
  });

  it("every ACTIVE_INDICATOR_COPY entry has quiet: true", () => {
    for (const lane of ALL_LANES) {
      expect(ACTIVE_INDICATOR_COPY[lane].quiet).toBe(true);
    }
  });

  it("every COMPLETION_COPY entry has showRewards: false", () => {
    for (const lane of ALL_LANES) {
      expect(COMPLETION_COPY[lane].showRewards).toBe(false);
    }
  });
});
