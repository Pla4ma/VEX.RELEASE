/**
 * Product Journey — Risk Coverage (Risks 2, 5)
 * Coach memory depth and privacy inventory
 */
import {
  experience,
} from "./debloat-test-helpers";

// ═══ Risk 2 — Coach Memory Depth ════════════════════════════════

describe("Risk 2 — Coach memory depth", () => {
  it("day 0 coach profile does not fabricate memory", () => {
    const exp = experience("coach_led");
    expect(exp.behaviorAdaptations).toContain("needs_more_signal");
    expect(exp.sessionDefaults.copy).toContain("default");
    expect(exp.sessionDefaults.duration).toBe(25);
    expect(exp.progressEmphasis).toBe("basic");
    expect(exp.userStage).toBe("new_user");
    expect(exp.homeSpotlight).toBe("none");
  });

  it("after session 1 coach still has limited signal", () => {
    const exp = experience("coach_led", {
      completedSessionDurations: [25],
      totalCompletedSessions: 1,
    });
    expect(exp.behaviorAdaptations).toContain("needs_more_signal");
    expect(exp.sessionDefaults.copy).toContain("default");
  });

  it("after 3+ sessions coach adapts to real data", () => {
    const exp = experience("coach_led", {
      completedSessionDurations: [25, 25, 30],
      totalCompletedSessions: 3,
      mostSuccessfulTimeOfDay: "morning",
    });
    expect(exp.behaviorAdaptations).toContain("duration_pattern");
    expect(exp.behaviorAdaptations).toContain("time_of_day_pattern");
    expect(exp.sessionDefaults.copy).toContain("best rhythm");
  });

  it("coach copy adapts per motivation style", () => {
    expect(
      experience("study_focused", {
        completedSessionDurations: [30, 30, 45],
        studyUsageRatio: 0.7,
        totalCompletedSessions: 5,
      }).coachMessageStyle,
    ).toBe("study_tutor");
    expect(
      experience("intense", {
        completedSessionDurations: [15, 15, 10],
        totalCompletedSessions: 3,
      }).coachTone,
    ).toBe("direct");
    expect(experience("game_like").coachMessageStyle).toBe("game_guide");
    expect(experience("calm").coachMessageStyle).toBe("reflection");
  });
});

// ═══ Risk 5 — Privacy Inventory ↔ App Manifest ══════════════════

describe("Risk 5 — Privacy inventory ↔ app manifest", () => {
  it("privacy inventory matches app manifest metadata", () => {
    const {
      PRIVACY_INVENTORY,
      getDataCategories,
      getPiiFields,
      getTrackingFields,
    } = require("../privacy/PrivacyInventory");
    const {
      PRIVACY_NUTRITION_LABEL,
    } = require("../app-store/AppStoreSubmissionPack");
    const categories = getDataCategories();
    const inventoryCategories = categories.map(
      (c: { category: string }) => c.category,
    );
    expect(inventoryCategories).toContain("Identifiers");
    expect(inventoryCategories).toContain("Usage Data");
    expect(inventoryCategories).toContain("Diagnostics");
    expect(inventoryCategories).toContain("Purchases");
    expect(inventoryCategories).toContain("Contact Info");
    expect(inventoryCategories).toContain("User Content");
    const linkedFromInventory = PRIVACY_INVENTORY.filter(
      (item: { linkedToUser: boolean }) => item.linkedToUser,
    ).map((item: { category: string }) => item.category);
    for (const label of PRIVACY_NUTRITION_LABEL.dataLinkedToUser) {
      expect(
        linkedFromInventory.some((cat: string) =>
          label.toLowerCase().includes(cat.toLowerCase()),
        ),
      ).toBe(true);
    }
    expect(getPiiFields()).toEqual([
      "Email address",
      "Push notification token",
    ]);
    expect(getTrackingFields()).toEqual([]);
    expect(
      categories.some((c: { usedForTracking: boolean }) => c.usedForTracking),
    ).toBe(false);
  });

  it("app store description excludes hidden feature names", () => {
    const {
      APP_STORE_METADATA,
    } = require("../app-store/AppStoreSubmissionPack");
    const description = APP_STORE_METADATA.description.toLowerCase();
    for (const term of [
      "battle pass",
      "shop",
      "inventory",
      "wagers",
      "rivals",
      "squads",
      "guild",
      "leaderboard",
    ]) {
      expect(description).not.toContain(term);
    }
  });

  it("review notes do not mention hidden features", () => {
    const { REVIEW_NOTES } = require("../app-store/AppStoreSubmissionPack");
    for (const term of [
      "battle pass",
      "shop",
      "inventory",
      "wagers",
      "rivals",
      "squads",
      "guild",
      "boss combat",
    ]) {
      expect(REVIEW_NOTES.toLowerCase()).not.toContain(term);
    }
  });

  it("review notes focus on core public features only", () => {
    const { REVIEW_NOTES } = require("../app-store/AppStoreSubmissionPack");
    expect(REVIEW_NOTES).toContain("Premium");
    expect(REVIEW_NOTES).toContain("completion screen with progress proof");
    expect(REVIEW_NOTES).toContain("Delete Account");
    expect(REVIEW_NOTES).toContain("No coins");
    expect(REVIEW_NOTES).toContain("No Day 0 paywall");
    expect(REVIEW_NOTES).toContain("No login required");
  });
});
