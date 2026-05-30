import {
  APP_STORE_METADATA,
  PRIVACY_NUTRITION_LABEL,
  REVIEW_NOTES,
} from "../AppStoreSubmissionPack";

describe("APP_STORE_METADATA", () => {
  it("should use the June 2026 VEX identity name", () => {
    expect(APP_STORE_METADATA.appName).toBe("VEX");
  });

  it("should use adaptive focus subtitle", () => {
    expect(APP_STORE_METADATA.subtitle).toBe("Focus that adapts to you");
  });

  it("should describe adaptive productivity without game references", () => {
    const desc = APP_STORE_METADATA.description;
    expect(desc).toContain("VEX changes based on how you work");
    expect(desc).toContain("Study, Run, Project, or Clean");
    expect(desc).toContain("durable intelligence");
    expect(desc).not.toContain("gamified");
    expect(desc).not.toContain("gamification");
    expect(desc).not.toContain("RPG");
    expect(desc).not.toContain("battle pass");
    expect(desc).not.toContain("coins");
    expect(desc).not.toContain("gems");
    expect(desc).not.toContain("AI chatbot");
  });

  it("should include relevant productivity keywords", () => {
    expect(APP_STORE_METADATA.keywords).toContain("focus");
    expect(APP_STORE_METADATA.keywords).toContain("productivity");
    expect(APP_STORE_METADATA.keywords).toContain("flow");
    expect(APP_STORE_METADATA.keywords).not.toContain("gamification");
    expect(APP_STORE_METADATA.keywords).not.toContain("pomodoro");
  });

  it("should have Productivity as primary category", () => {
    expect(APP_STORE_METADATA.primaryCategory).toBe("Productivity");
    expect(APP_STORE_METADATA.secondaryCategory).toBe("Health & Fitness");
  });

  it("should have age rating 4+", () => {
    expect(APP_STORE_METADATA.ageRating).toBe("4+");
  });

  it("should include support and privacy URLs", () => {
    expect(APP_STORE_METADATA.supportUrl).toBe("https://vex.app/support");
    expect(APP_STORE_METADATA.privacyPolicyUrl).toBe("https://vex.app/privacy");
  });
});

describe("REVIEW_NOTES", () => {
  it("should describe paywall timing", () => {
    expect(REVIEW_NOTES).toContain("No paywall before session 5");
  });

  it("should describe no coins or consumable purchases", () => {
    expect(REVIEW_NOTES).toContain("No coins");
  });

  it("should not mention game economy concepts", () => {
    expect(REVIEW_NOTES).not.toContain("game monetization");
    expect(REVIEW_NOTES).not.toContain("gamified");
  });

  it("should mention paywall appears only on premium action tap", () => {
    expect(REVIEW_NOTES).toContain("Paywall appears only on premium action tap");
  });

  it("should include account deletion instructions", () => {
    expect(REVIEW_NOTES).toContain("Delete Account");
  });

  it("should include offline mode instructions", () => {
    expect(REVIEW_NOTES).toContain("Offline");
  });

  it("should include restore purchases instructions", () => {
    expect(REVIEW_NOTES).toContain("Restore");
  });
});

describe("PRIVACY_NUTRITION_LABEL", () => {
  it("should declare no tracking", () => {
    expect(PRIVACY_NUTRITION_LABEL.dataUsedForTracking).toHaveLength(0);
  });

  it("should declare data linked to user", () => {
    expect(PRIVACY_NUTRITION_LABEL.dataLinkedToUser.length).toBeGreaterThan(0);
    expect(PRIVACY_NUTRITION_LABEL.dataLinkedToUser).toContain(
      "Contact Info (Email)",
    );
    expect(PRIVACY_NUTRITION_LABEL.dataLinkedToUser).toContain(
      "Identifiers (User ID)",
    );
    expect(PRIVACY_NUTRITION_LABEL.dataLinkedToUser).toContain(
      "Usage Data (Sessions, Focus Score, streaks)",
    );
    expect(PRIVACY_NUTRITION_LABEL.dataLinkedToUser).toContain(
      "Purchases (Subscription status)",
    );
  });

  it("should declare diagnostics not linked to user", () => {
    expect(PRIVACY_NUTRITION_LABEL.dataNotLinkedToUser).toContain(
      "Diagnostics (Crash logs, performance)",
    );
  });

  it("should include account deletion info", () => {
    expect(PRIVACY_NUTRITION_LABEL.accountDeletion).toContain("Delete Account");
  });
});
