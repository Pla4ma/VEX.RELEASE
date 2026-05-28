import { describe, expect, it } from "@jest/globals";
import {
  getDay1ReturnMoment,
  getDay0SessionSuggestion,
} from "../service";
import {
  shouldShowDay3Memory,
  shouldOfferRescue,
  shouldShowPremiumAfterValue,
  getPremiumCopy,
} from "../retention-guards";

describe("getDay1ReturnMoment", () => {
  it("returns mode-specific copy for student", () => {
    const moment = getDay1ReturnMoment("student");
    expect(moment.headline).toBe("Pick up with one focused study block.");
    expect(moment.sessionMinutes).toBe(15);
  });

  it("returns mode-specific copy for game_like", () => {
    const moment = getDay1ReturnMoment("game_like");
    expect(moment.headline).toBe("Your next clean run is ready.");
    expect(moment.sessionMinutes).toBe(15);
  });

  it("returns mode-specific copy for minimal_normal", () => {
    const moment = getDay1ReturnMoment("minimal_normal");
    expect(moment.headline).toBe("One clean block is enough today.");
  });
});

describe("shouldShowDay3Memory", () => {
  it("returns true on day 3+ with 3+ sessions and not yet seen", () => {
    expect(
      shouldShowDay3Memory({
        daysSinceOnboarding: 3,
        completedSessions: 3,
        hasSeenMemoryInsight: false,
      }),
    ).toBe(true);
  });

  it("returns false if already seen", () => {
    expect(
      shouldShowDay3Memory({
        daysSinceOnboarding: 3,
        completedSessions: 3,
        hasSeenMemoryInsight: true,
      }),
    ).toBe(false);
  });

  it("returns false if not enough sessions", () => {
    expect(
      shouldShowDay3Memory({
        daysSinceOnboarding: 3,
        completedSessions: 1,
        hasSeenMemoryInsight: false,
      }),
    ).toBe(false);
  });
});

describe("shouldOfferRescue", () => {
  it("returns true on day 4+ with inactivity", () => {
    expect(
      shouldOfferRescue({
        daysSinceOnboarding: 4,
        completedSessions: 3,
        hasCompletedToday: false,
        inactivityDays: 2,
      }),
    ).toBe(true);
  });

  it("returns false if completed today", () => {
    expect(
      shouldOfferRescue({
        daysSinceOnboarding: 4,
        completedSessions: 3,
        hasCompletedToday: true,
        inactivityDays: 2,
      }),
    ).toBe(false);
  });

  it("returns false before day 4", () => {
    expect(
      shouldOfferRescue({
        daysSinceOnboarding: 2,
        completedSessions: 2,
        hasCompletedToday: false,
        inactivityDays: 1,
      }),
    ).toBe(false);
  });
});

describe("shouldShowPremiumAfterValue", () => {
  it("returns true on day 7+ after weekly insight", () => {
    expect(
      shouldShowPremiumAfterValue({
        daysSinceOnboarding: 7,
        hasSeenWeeklyInsight: true,
      }),
    ).toBe(true);
  });

  it("returns false if insight not yet seen", () => {
    expect(
      shouldShowPremiumAfterValue({
        daysSinceOnboarding: 7,
        hasSeenWeeklyInsight: false,
      }),
    ).toBe(false);
  });
});

describe("getPremiumCopy", () => {
  it("returns lane-specific premium copy", () => {
    expect(getPremiumCopy("student")).toBe("Go deeper with Study Intelligence.");
    expect(getPremiumCopy("game_like")).toBe(
      "Upgrade your Focus Run intelligence.",
    );
    expect(getPremiumCopy("deep_creative")).toBe(
      "Keep deeper project memory.",
    );
    expect(getPremiumCopy("minimal_normal")).toBe(
      "Unlock quieter weekly planning.",
    );
  });
});

describe("getDay0SessionSuggestion", () => {
  it("returns student-specific session suggestion", () => {
    const suggestion = getDay0SessionSuggestion("student");
    expect(suggestion.durationMinutes).toBe(15);
    expect(suggestion.type).toBe("STUDY");
  });

  it("returns minimal_normal-specific session suggestion", () => {
    const suggestion = getDay0SessionSuggestion("minimal_normal");
    expect(suggestion.durationMinutes).toBe(10);
    expect(suggestion.type).toBe("LIGHT_FOCUS");
  });
});
