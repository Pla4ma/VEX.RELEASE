/**
 * Companion Feature — Personality Responses + Constants Tests
 */

jest.mock("../../../events/EventBus", () => ({
  eventBus: {
    publish: jest.fn(),
    subscribe: jest.fn(() => jest.fn()),
  },
}));

jest.mock("../../../shared/analytics/analytics-service", () => ({
  capture: jest.fn(),
}));

import { RESPONSES } from "../personality-responses";
import { EVOLUTION_THRESHOLDS, MOOD_RULES, ELEMENT_THEMES } from "../types";
import type { CompanionPhase } from "../types";

describe("RESPONSES personality data", () => {
  it("has responses for every personality event type", () => {
    const eventTypes = [
      "BOSS_DEFEATED", "S_GRADE_SESSION", "STREAK_MILESTONE",
      "STREAK_BROKEN", "COMEBACK", "LEVEL_UP", "PERFECT_SESSION",
    ];
    for (const type of eventTypes) {
      expect(RESPONSES[type as keyof typeof RESPONSES]).toBeDefined();
      expect(RESPONSES[type as keyof typeof RESPONSES].length).toBeGreaterThan(0);
    }
  });

  it("each response has required fields", () => {
    for (const [_type, responses] of Object.entries(RESPONSES)) {
      for (const response of responses) {
        expect(response.animation).toBeDefined();
        expect(response.dialogue).toBeInstanceOf(Array);
        expect(response.dialogue.length).toBeGreaterThan(0);
        expect(response.mood).toBeDefined();
        expect(response.duration).toBeGreaterThan(0);
      }
    }
  });
});

describe("EVOLUTION_THRESHOLDS", () => {
  it("has threshold for every phase", () => {
    const phases: CompanionPhase[] = ["EGG", "HATCHING", "YOUNG", "MATURE", "AWAKENED", "TRANSCENDENT"];
    for (const phase of phases) {
      expect(EVOLUTION_THRESHOLDS[phase]).toBeDefined();
    }
  });

  it("EGG has 0 threshold", () => {
    expect(EVOLUTION_THRESHOLDS.EGG).toBe(0);
  });

  it("TRANSCENDENT has Infinity threshold", () => {
    expect(EVOLUTION_THRESHOLDS.TRANSCENDENT).toBe(Infinity);
  });

  it("thresholds increase with phase progression", () => {
    expect(EVOLUTION_THRESHOLDS.HATCHING).toBeLessThan(EVOLUTION_THRESHOLDS.YOUNG);
    expect(EVOLUTION_THRESHOLDS.YOUNG).toBeLessThan(EVOLUTION_THRESHOLDS.MATURE);
    expect(EVOLUTION_THRESHOLDS.MATURE).toBeLessThan(EVOLUTION_THRESHOLDS.AWAKENED);
  });
});

describe("MOOD_RULES", () => {
  it("defines rules for all moods", () => {
    const moods = ["SLEEPY", "CONTENT", "FOCUSED", "DETERMINED", "ECSTATIC", "STRUGGLING", "DANGER"];
    for (const mood of moods) {
      expect(MOOD_RULES[mood as keyof typeof MOOD_RULES]).toBeDefined();
    }
  });
});

describe("ELEMENT_THEMES", () => {
  it("has theme for every element", () => {
    const elements = ["FLAME", "WAVE", "TERRA", "ZEPHYR", "VOID", "LUMINA"];
    for (const element of elements) {
      expect(ELEMENT_THEMES[element as keyof typeof ELEMENT_THEMES]).toBeDefined();
      expect(ELEMENT_THEMES[element as keyof typeof ELEMENT_THEMES].primary).toBeDefined();
      expect(ELEMENT_THEMES[element as keyof typeof ELEMENT_THEMES].ambience).toBeDefined();
    }
  });
});
