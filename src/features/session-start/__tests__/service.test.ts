import {
  buildSessionStartHero,
  buildSessionStartSummary,
  buildFocusModeCards,
  getOfflineSessionStartMessage,
  parseSessionSetupParams,
  shouldAutoApplySmartSuggestion,
  shouldOpenCustomizationByDefault,
} from "../service";

describe("session-start service", () => {
  it("parses valid setup params without warnings", () => {
    const result = parseSessionSetupParams({
      goal: "Write launch brief",
      presetId: "pomodoro",
      suggestedDurationSeconds: 1500,
    });

    expect(result.params.goal).toBe("Write launch brief");
    expect(result.params.presetId).toBe("pomodoro");
    expect(result.warningMessage).toBeNull();
  });

  it("falls back to safe defaults for invalid setup params", () => {
    const result = parseSessionSetupParams({
      suggestedDurationSeconds: -10,
    });

    expect(result.params).toEqual({});
    expect(result.warningMessage).toBeTruthy();
  });

  it("builds a fast-start summary with premium-friendly labels", () => {
    const summary = buildSessionStartSummary({
      currentThemeName: "Aurora",
      durationMinutes: 25,
      hasCustomizations: false,
    });

    expect(summary.ctaLabel).toBe("Start 25 Min Session");
    expect(summary.customizationLabel).toBe("Tune session");
    expect(summary.subtitle).toContain("Aurora");
  });

  it("explains offline behavior only when needed", () => {
    expect(getOfflineSessionStartMessage(false)).toBeNull();
    expect(getOfflineSessionStartMessage(true)).toContain("offline");
  });

  it("keeps customization collapsed for lightweight entry params", () => {
    expect(
      shouldOpenCustomizationByDefault({
        goal: "Write launch brief",
        selectedThemeId: "aurora",
      }),
    ).toBe(false);
  });

  it("only auto-applies smart suggestions when route and draft do not override fast start", () => {
    expect(
      shouldAutoApplySmartSuggestion({
        hasSavedDraft: false,
        params: {},
        smartSuggestionPresetId: "deep",
      }),
    ).toBe(true);

    expect(
      shouldAutoApplySmartSuggestion({
        hasSavedDraft: true,
        params: {},
        smartSuggestionPresetId: "deep",
      }),
    ).toBe(false);
  });

  it("builds contextual session hero copy for comeback and onboarding flows", () => {
    const comebackHero = buildSessionStartHero({
      durationMinutes: 25,
      params: {
        comebackMessage: "Welcome back",
        comebackMultiplier: 2,
      },
      presetName: "Pomodoro",
      smartSuggestionDescription: null,
    });
    const onboardingHero = buildSessionStartHero({
      durationMinutes: 15,
      params: {
        source: "onboarding_first_session",
      },
      presetName: "Quick Focus",
      smartSuggestionDescription: null,
    });

    expect(comebackHero.eyebrow).toBe("Comeback Session");
    expect(onboardingHero.eyebrow).toBe("First Session");
  });

  it("builds mode-specific focus tab cards without pushing 60-minute first choices", () => {
    const cards = buildFocusModeCards({ streakDays: 0 });

    expect(cards.map((card) => card.mode)).toEqual([
      "SPRINT",
      "LIGHT_FOCUS",
      "STUDY",
      "RECOVERY",
    ]);
    expect(cards.every((card) => card.durationSeconds <= 25 * 60)).toBe(true);
    expect(cards[0]?.accessibilityLabel).toContain("15 minute sprint");
  });
});
