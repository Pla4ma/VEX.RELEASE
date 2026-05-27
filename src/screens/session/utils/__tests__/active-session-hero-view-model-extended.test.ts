import {
  buildActiveSessionHeroViewModel,
  basePolicy,
  baseInput,
} from "./active-session-hero-view-model.helpers";

describe("buildActiveSessionHeroViewModel", () => {
  it("purity score only shown when policy allows", () => {
    const vmWithPurity = buildActiveSessionHeroViewModel({
      ...baseInput,
      displayPolicy: {
        ...basePolicy,
        showPurityScore: true,
      },
    });

    expect(vmWithPurity.showPurityScore).toBe(true);
    expect(vmWithPurity.perfectFocusActive).toBe(true);
    expect(vmWithPurity.purityScore).toBe(95);

    const vmWithoutPurity = buildActiveSessionHeroViewModel(baseInput);
    expect(vmWithoutPurity.showPurityScore).toBe(false);
    expect(vmWithoutPurity.perfectFocusActive).toBe(false);
  });

  it("no full boss HUD during active focus", () => {
    const vm = buildActiveSessionHeroViewModel(baseInput);
    expect(vm.heroDensity).toBe("minimal");
    expect(vm.signalPill).toBeNull();
    expect(vm.showPurityScore).toBe(false);
  });

  it("clean lane active focus is minimal density with no extra stats", () => {
    const vm = buildActiveSessionHeroViewModel(baseInput);
    expect(vm.heroDensity).toBe("minimal");
    expect(vm.momentumScores).toBeNull();
    expect(vm.dailyProgress).toBeNull();
    expect(vm.showPurityScore).toBe(false);
    expect(vm.secondaryInfo).toBeNull();
  });

  it("project lane view model has secondary info when lanePresentation provided", () => {
    const vm = buildActiveSessionHeroViewModel({
      ...baseInput,
      lanePresentation: {
        animation: "low_medium",
        copyTone: "reflective_continuity",
        density: "medium",
        emptyStateCta: "Resume a project thread",
        errorStateHint: "Keep the thread intact and retry.",
        icon: "pen-tool",
        lane: "deep_creative",
        loadingState: "project_thread_skeleton",
        shouldRenderSkeleton: true,
        visualFeeling: "studio_workbench",
      },
    });

    expect(vm.laneAccent).toBe("studio_workbench");
    expect(vm.secondaryInfo).toBe("Next move");
  });

  it("reduced motion flag propagates to view model", () => {
    const vm = buildActiveSessionHeroViewModel({
      ...baseInput,
      isReducedMotion: true,
    });

    expect(vm.isReducedMotion).toBe(true);
  });

  it("no full boss HUD at default — only timer, progress, phase", () => {
    const vm = buildActiveSessionHeroViewModel(baseInput);
    expect(vm.heroDensity).toBe("minimal");
    expect(vm.signalPill).toBeNull();
    expect(vm.momentumScores).toBeNull();
    expect(vm.dailyProgress).toBeNull();
    expect(vm.showPurityScore).toBe(false);
  });
});
