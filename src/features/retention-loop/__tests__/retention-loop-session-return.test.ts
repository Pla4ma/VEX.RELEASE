import { describe, expect, it } from "@jest/globals";
import {
  getDay0SessionSuggestion,
  getDay1ReturnMoment,
} from "../service";
import {
  getModeReturnHook,
  getModeReturnReason,
} from "../retention-guards";

const ALL_LANES = ["student", "game_like", "deep_creative", "minimal_normal"] as const;

describe("getDay0SessionSuggestion", () => {
  it("returns student session suggestion with correct type", () => {
    const suggestion = getDay0SessionSuggestion("student");
    expect(suggestion.durationMinutes).toBeGreaterThan(0);
    expect(suggestion.type).toBe("STUDY");
    expect(suggestion.taskPrompt.length).toBeGreaterThan(0);
  });

  it("returns game_like session suggestion", () => {
    const suggestion = getDay0SessionSuggestion("game_like");
    expect(suggestion.type).toBe("SPRINT");
    expect(suggestion.taskPrompt.length).toBeGreaterThan(0);
  });

  it("returns deep_creative session suggestion", () => {
    const suggestion = getDay0SessionSuggestion("deep_creative");
    expect(suggestion.type).toBe("DEEP_WORK");
  });

  it("returns minimal_normal session suggestion", () => {
    const suggestion = getDay0SessionSuggestion("minimal_normal");
    expect(suggestion.type).toBe("LIGHT_FOCUS");
    expect(suggestion.durationMinutes).toBeGreaterThan(0);
  });
});

describe("getDay1ReturnMoment", () => {
  it("returns headline, cta, and sessionMinutes for each lane", () => {
    for (const lane of ALL_LANES) {
      const moment = getDay1ReturnMoment(lane);
      expect(moment.headline.length).toBeGreaterThan(0);
      expect(moment.cta.length).toBeGreaterThan(0);
      expect(moment.sessionMinutes).toBeGreaterThanOrEqual(5);
    }
  });

  it("returns distinct headlines per lane", () => {
    const headlines = ALL_LANES.map((lane) => getDay1ReturnMoment(lane).headline);
    const unique = new Set(headlines);
    expect(unique.size).toBe(ALL_LANES.length);
  });
});

describe("getModeReturnHook", () => {
  it("returns non-empty string for each lane", () => {
    for (const lane of ALL_LANES) {
      expect(getModeReturnHook(lane).length).toBeGreaterThan(0);
    }
  });

  it("returns distinct hooks per lane", () => {
    const hooks = ALL_LANES.map((l) => getModeReturnHook(l));
    expect(new Set(hooks).size).toBe(ALL_LANES.length);
  });
});

describe("getModeReturnReason", () => {
  it("returns non-empty string for each lane", () => {
    for (const lane of ALL_LANES) {
      expect(getModeReturnReason(lane).length).toBeGreaterThan(0);
    }
  });

  it("returns distinct reasons per lane", () => {
    const reasons = ALL_LANES.map((l) => getModeReturnReason(l));
    expect(new Set(reasons).size).toBe(ALL_LANES.length);
  });
});
