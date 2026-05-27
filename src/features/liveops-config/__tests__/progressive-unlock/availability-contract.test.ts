import {
  availabilityFor,
  GAMER_PROFILE,
  CALM_PROFILE,
  STUDENT_PROFILE,
  INTENSE_PROFILE,
  buildFeatureAccess,
} from "./helpers";

// ============================================================================
// 0.1 — FeatureAvailability contract: every state has correct field values
// ============================================================================

describe("FeatureAvailability contract", () => {
  describe("disabled state", () => {
    it("returns all-false for final_release_deactivated features at any session count", () => {
      const avail = availabilityFor(0, "battle_pass");
      expect(avail.state).toBe("disabled");
      expect(avail.canRenderEntryPoint).toBe(false);
      expect(avail.canNavigate).toBe(false);
      expect(avail.canQuery).toBe(false);
      expect(avail.canUseBackend).toBe(false);
      expect(avail.canRegisterRoute).toBe(false);
      expect(avail.canSubscribeToEvents).toBe(false);
      expect(avail.canShowNotification).toBe(false);
    });

    it("returns all-false for final_release_deactivated features even at 999 sessions", () => {
      const avail = availabilityFor(999, "squads");
      expect(avail.state).toBe("disabled");
      expect(avail.canRegisterRoute).toBe(false);
    });
  });

  describe("unlocked state", () => {
    it("returns all-true for core features at 0 sessions", () => {
      const avail = availabilityFor(0, "focus_session");
      expect(avail.state).toBe("unlocked");
      expect(avail.canRenderEntryPoint).toBe(true);
      expect(avail.canNavigate).toBe(true);
      expect(avail.canQuery).toBe(true);
      expect(avail.canUseBackend).toBe(true);
      expect(avail.canRegisterRoute).toBe(true);
      expect(avail.canSubscribeToEvents).toBe(true);
      expect(avail.canShowNotification).toBe(true);
    });

    it("returns all-true for progressively unlocked features past threshold", () => {
      const avail = availabilityFor(8, "boss_tab", GAMER_PROFILE);
      expect(avail.state).toBe("unlocked");
      expect(avail.canNavigate).toBe(true);
      expect(avail.canRegisterRoute).toBe(true);
      expect(avail.canSubscribeToEvents).toBe(true);
    });
  });

  describe("teased state", () => {
    it("shows entry point but blocks navigation, queries, routes, events, notifications", () => {
      const avail = availabilityFor(2, "companion_detail");
      expect(avail.state).toBe("teased");
      expect(avail.canRenderEntryPoint).toBe(true);
      expect(avail.canNavigate).toBe(false);
      expect(avail.canQuery).toBe(false);
      expect(avail.canUseBackend).toBe(false);
      expect(avail.canRegisterRoute).toBe(false);
      expect(avail.canSubscribeToEvents).toBe(false);
      expect(avail.canShowNotification).toBe(false);
    });
  });

  describe("locked state", () => {
    it("returns all-false for features before teaser threshold", () => {
      const avail = availabilityFor(0, "challenges");
      expect(avail.state).toBe("locked");
      expect(avail.canRenderEntryPoint).toBe(false);
      expect(avail.canNavigate).toBe(false);
      expect(avail.canRegisterRoute).toBe(false);
    });
  });
});

// ============================================================================
// 0.2 — Motivation profiles accelerate and restrict unlocks
// ============================================================================

describe("motivation profile effects", () => {
  it("accelerates Boss unlock for game_like profile (7→5)", () => {
    const avail = availabilityFor(5, "boss_tab", GAMER_PROFILE);
    expect(avail.state).toBe("unlocked");
    expect(avail.canNavigate).toBe(true);
  });

  it("delays Boss unlock for calm profile (7→15)", () => {
    const avail7 = availabilityFor(7, "boss_tab", CALM_PROFILE);
    expect(avail7.state).toBe("disabled");

    const avail14 = availabilityFor(14, "boss_tab", CALM_PROFILE);
    expect(avail14.state).toBe("disabled");

    const avail20 = availabilityFor(20, "boss_tab", CALM_PROFILE);
    expect(avail20.state).toBe("unlocked");
  });

  it("hides Boss from calm profile entirely until 20 sessions", () => {
    const { features } = buildFeatureAccess({
      totalCompletedSessions: 5,
      motivationProfile: CALM_PROFILE,
    });
    expect(features.boss_tab.isVisible).toBe(false);
  });

  it("accelerates Content Study for student profile (12→5)", () => {
    const avail = availabilityFor(5, "content_study", STUDENT_PROFILE);
    expect(avail.state).toBe("unlocked");
    expect(avail.canNavigate).toBe(true);
  });

  it("delays Content Study for calm profile (12→18)", () => {
    const avail12 = availabilityFor(12, "content_study", CALM_PROFILE);
    expect(avail12.state).toBe("teased");

    const avail18 = availabilityFor(18, "content_study", CALM_PROFILE);
    expect(avail18.state).toBe("unlocked");
  });

  it("accelerates Challenges for intense profile (5→3)", () => {
    const avail = availabilityFor(3, "challenges", INTENSE_PROFILE);
    expect(avail.state).toBe("unlocked");
  });

  it("delays Challenges for calm profile (5→8)", () => {
    const avail5 = availabilityFor(5, "challenges", CALM_PROFILE);
    expect(avail5.state).toBe("disabled");

    const avail8 = availabilityFor(8, "challenges", CALM_PROFILE);
    expect(avail8.state).toBe("teased");

    const avail10 = availabilityFor(10, "challenges", CALM_PROFILE);
    expect(avail10.state).toBe("unlocked");
  });

  it("accelerates Companion for calm and student profiles (3→2)", () => {
    const avail2calm = availabilityFor(2, "companion_detail", CALM_PROFILE);
    expect(avail2calm.state).toBe("unlocked");

    const avail2student = availabilityFor(2, "companion_detail", STUDENT_PROFILE);
    expect(avail2student.state).toBe("unlocked");
  });

  it("delays Companion for intense profile (3→4)", () => {
    const avail3 = availabilityFor(3, "companion_detail", INTENSE_PROFILE);
    expect(avail3.state).toBe("teased");

    const avail4 = availabilityFor(4, "companion_detail", INTENSE_PROFILE);
    expect(avail4.state).toBe("unlocked");
  });

  it("does not modify thresholds when no motivation profile is provided", () => {
    const avail = availabilityFor(5, "challenges");
    expect(avail.state).toBe("unlocked");
  });
});
