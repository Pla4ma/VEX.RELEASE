import {
  buildActiveSessionHeroViewModel,
  basePolicy,
  baseInput,
} from "./active-session-hero-view-model.helpers";

describe("buildActiveSessionHeroViewModel", () => {
  it("calm active hero has no boss/purity/momentum/daily progress", () => {
    const vm = buildActiveSessionHeroViewModel(baseInput);

    expect(vm.signalPill).toBeNull();
    expect(vm.showPurityScore).toBe(false);
    expect(vm.perfectFocusActive).toBe(false);
    expect(vm.momentumScores).toBeNull();
    expect(vm.dailyProgress).toBeNull();
    expect(vm.todayFocusSeconds).toBeNull();
  });

  it("study active hero includes study target", () => {
    const vm = buildActiveSessionHeroViewModel({
      ...baseInput,
      displayPolicy: {
        ...basePolicy,
        showStudyTarget: true,
      },
    });

    expect(vm.studyTargetLabel).toBe("Study target");
    expect(vm.signalPill).toBeNull();
    expect(vm.dailyProgress).toBeNull();
  });

  it("game-like active hero includes tiny boss signal", () => {
    const vm = buildActiveSessionHeroViewModel({
      ...baseInput,
      displayPolicy: {
        ...basePolicy,
        heroDensity: "standard",
        showBossTinyIndicator: true,
      },
    });

    expect(vm.signalPill).toEqual({ type: "boss", label: "Challenge waiting" });
    expect(vm.momentumScores).toBeNull();
    expect(vm.dailyProgress).toBeNull();
  });

  it("paused hero can include secondary stats", () => {
    const vm = buildActiveSessionHeroViewModel({
      ...baseInput,
      displayPolicy: {
        ...basePolicy,
        heroDensity: "standard",
        showDailyProgress: true,
        showMomentumScore: true,
      },
    });

    expect(vm.heroDensity).toBe("standard");
    expect(vm.dailyProgress).toBe(50);
    expect(vm.momentumScores).toEqual([75, 80, 85]);
    expect(vm.todayFocusSeconds).toBe(3600);
  });

  it("perfect focus signal only shows above minimal density", () => {
    const vmStandard = buildActiveSessionHeroViewModel({
      ...baseInput,
      perfectFocusActive: true,
      displayPolicy: {
        ...basePolicy,
        heroDensity: "standard",
      },
    });

    expect(vmStandard.signalPill).toEqual({
      type: "focus",
      label: "Clean focus",
    });
  });

  it("perfect focus signal hidden at minimal density", () => {
    const vm = buildActiveSessionHeroViewModel({
      ...baseInput,
      perfectFocusActive: true,
      displayPolicy: {
        ...basePolicy,
        heroDensity: "minimal",
      },
    });

    expect(vm.signalPill).toBeNull();
  });

  it("timer and progress always present", () => {
    const vm = buildActiveSessionHeroViewModel(baseInput);

    expect(vm.remainingSeconds).toBe(600);
    expect(vm.completionPercentage).toBe(42);
    expect(vm.elapsedSeconds).toBe(120);
    expect(vm.phaseAccent).toBe("blue");
    expect(vm.phaseLabel).toBe("Focus");
  });
});
