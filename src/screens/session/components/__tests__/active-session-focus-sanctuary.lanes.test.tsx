import { buildViewModel, renderHero, hasText } from "./active-session-focus-sanctuary.helpers";

describe("ActiveSessionHero sanctuary > lane-specific rendering", () => {
  it("clean lane active session shows timer only, no extra widgets", () => {
    const vm = buildViewModel({
      heroDensity: "minimal",
      laneAccent: "quiet_planner",
      secondaryInfo: null,
    });
    const hero = renderHero(vm);

    expect(hasText(hero, "Timer Ring")).toBe(true);
    expect(hasText(hero, "Challenge waiting")).toBe(false);
    expect(hasText(hero, "Clean focus")).toBe(false);
    expect(hasText(hero, "Calibrating momentum...")).toBe(false);
    expect(hasText(hero, "Elapsed")).toBe(false);
    expect(hasText(hero, "Study target")).toBe(false);
  });

  it("study active session shows study target only", () => {
    const vm = buildViewModel({
      studyTargetLabel: "Study Session",
      heroDensity: "minimal",
    });
    const hero = renderHero(vm);

    expect(hasText(hero, "Study Session")).toBe(true);
    expect(hasText(hero, "Challenge waiting")).toBe(false);
    expect(hasText(hero, "Calibrating momentum...")).toBe(false);
    expect(hasText(hero, "Elapsed")).toBe(false);
  });

  it("run lane active session shows tiny boss signal only, no full HUD", () => {
    const vm = buildViewModel({
      heroDensity: "minimal",
      signalPill: { type: "boss", label: "Challenge waiting" },
    });
    const hero = renderHero(vm);

    expect(hasText(hero, "Challenge waiting")).toBe(true);
    expect(hasText(hero, "Elapsed")).toBe(false);
    expect(hasText(hero, "Calibrating momentum...")).toBe(false);
    expect(hasText(hero, "Purity Score")).toBe(false);
  });

  it("project active session shows secondary info when available", () => {
    const vm = buildViewModel({
      heroDensity: "minimal",
      secondaryInfo: "Next move",
      laneAccent: "studio_workbench",
    });
    const hero = renderHero(vm);

    expect(hasText(hero, "Timer Ring")).toBe(true);
    expect(hasText(hero, "Challenge waiting")).toBe(false);
    expect(hasText(hero, "Elapsed")).toBe(false);
    expect(vm.secondaryInfo).toBe("Next move");
    expect(vm.laneAccent).toBe("studio_workbench");
  });

  it("no full boss HUD rendered by default — only signal pill at most", () => {
    const vm = buildViewModel();
    const hero = renderHero(vm);

    expect(hasText(hero, "Challenge waiting")).toBe(false);
    expect(hasText(hero, "Purity Score")).toBe(false);
    expect(hasText(hero, "Elapsed")).toBe(false);
    expect(vm.heroDensity).toBe("minimal");
  });

  it("reduced motion honored — hero renders without crash", () => {
    const vm = buildViewModel({
      isReducedMotion: true,
      studyTargetLabel: "Study Session",
      signalPill: { type: "boss", label: "Challenge waiting" },
    });
    const hero = renderHero(vm);

    expect(hasText(hero, "Timer Ring")).toBe(true);
    expect(hasText(hero, "Study Session")).toBe(true);
    expect(hasText(hero, "Challenge waiting")).toBe(true);
    expect(vm.isReducedMotion).toBe(true);
  });

  it("hidden systems not mounted — no purity, no momentum, no daily progress in minimal mode", () => {
    const vm = buildViewModel({
      heroDensity: "minimal",
      perfectFocusActive: false,
      showPurityScore: false,
      momentumScores: null,
      dailyProgress: null,
    });
    const hero = renderHero(vm);

    expect(hasText(hero, "Purity Score")).toBe(false);
    expect(hasText(hero, "Completion Aura")).toBe(false);
    expect(hasText(hero, "Calibrating momentum...")).toBe(false);
    expect(hasText(hero, "Elapsed")).toBe(false);
    expect(hasText(hero, "Timer Ring")).toBe(true);
  });
});
