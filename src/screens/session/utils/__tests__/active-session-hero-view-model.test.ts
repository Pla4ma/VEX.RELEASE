import { buildActiveSessionHeroViewModel } from '../active-session-hero-view-model';
import type { ActiveSessionDisplayPolicy } from '../active-session-display-policy';

const basePolicy: ActiveSessionDisplayPolicy = {
  heroDensity: 'minimal',
  showBossHUD: false,
  showBossTinyIndicator: false,
  showCoachBanner: false,
  showCompanionLayer: false,
  showContractReminder: false,
  showDailyProgress: false,
  showModeOverlay: false,
  showMomentumScore: false,
  showPurityScore: false,
  showStudyTarget: false,
};

const baseInput = {
  completionPercentage: 42,
  dailyProgress: 50,
  displayPolicy: basePolicy,
  elapsedSeconds: 120,
  isReducedMotion: false,
  lanePresentation: null,
  momentumScores: [75, 80, 85],
  perfectFocusActive: true,
  phaseAccent: 'blue',
  phaseIcon: 'clock' as const,
  phaseLabel: 'Focus',
  purityLabel: 'Elite' as const,
  purityScore: 95,
  remainingSeconds: 600,
  streakMultiplier: 2.5,
  studyTargetLabel: 'Study target',
  todayFocusSeconds: 3600,
};

describe('buildActiveSessionHeroViewModel', () => {
  it('calm active hero has no boss/purity/momentum/daily progress', () => {
    const vm = buildActiveSessionHeroViewModel(baseInput);

    expect(vm.signalPill).toBeNull();
    expect(vm.showPurityScore).toBe(false);
    expect(vm.perfectFocusActive).toBe(false);
    expect(vm.momentumScores).toBeNull();
    expect(vm.dailyProgress).toBeNull();
    expect(vm.todayFocusSeconds).toBeNull();
  });

  it('study active hero includes study target', () => {
    const vm = buildActiveSessionHeroViewModel({
      ...baseInput,
      displayPolicy: {
        ...basePolicy,
        showStudyTarget: true,
      },
    });

    expect(vm.studyTargetLabel).toBe('Study target');
    expect(vm.signalPill).toBeNull();
    expect(vm.dailyProgress).toBeNull();
  });

  it('game-like active hero includes tiny boss signal', () => {
    const vm = buildActiveSessionHeroViewModel({
      ...baseInput,
      displayPolicy: {
        ...basePolicy,
        heroDensity: 'standard',
        showBossTinyIndicator: true,
      },
    });

    expect(vm.signalPill).toEqual({ type: 'boss', label: 'Challenge waiting' });
    expect(vm.momentumScores).toBeNull();
    expect(vm.dailyProgress).toBeNull();
  });

  it('paused hero can include secondary stats', () => {
    const vm = buildActiveSessionHeroViewModel({
      ...baseInput,
      displayPolicy: {
        ...basePolicy,
        heroDensity: 'standard',
        showDailyProgress: true,
        showMomentumScore: true,
      },
    });

    expect(vm.heroDensity).toBe('standard');
    expect(vm.dailyProgress).toBe(50);
    expect(vm.momentumScores).toEqual([75, 80, 85]);
    expect(vm.todayFocusSeconds).toBe(3600);
  });

  it('perfect focus signal only shows above minimal density', () => {
    const vmStandard = buildActiveSessionHeroViewModel({
      ...baseInput,
      perfectFocusActive: true,
      displayPolicy: {
        ...basePolicy,
        heroDensity: 'standard',
      },
    });

    expect(vmStandard.signalPill).toEqual({ type: 'focus', label: 'Clean focus' });
  });

  it('perfect focus signal hidden at minimal density', () => {
    const vm = buildActiveSessionHeroViewModel({
      ...baseInput,
      perfectFocusActive: true,
      displayPolicy: {
        ...basePolicy,
        heroDensity: 'minimal',
      },
    });

    expect(vm.signalPill).toBeNull();
  });

  it('timer and progress always present', () => {
    const vm = buildActiveSessionHeroViewModel(baseInput);

    expect(vm.remainingSeconds).toBe(600);
    expect(vm.completionPercentage).toBe(42);
    expect(vm.elapsedSeconds).toBe(120);
    expect(vm.phaseAccent).toBe('blue');
    expect(vm.phaseLabel).toBe('Focus');
  });

  it('purity score only shown when policy allows', () => {
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

  it('no full boss HUD during active focus', () => {
    const vm = buildActiveSessionHeroViewModel(baseInput);
    expect(vm.heroDensity).toBe('minimal');
    expect(vm.signalPill).toBeNull();
    expect(vm.showPurityScore).toBe(false);
  });

  it('clean lane active focus is minimal density with no extra stats', () => {
    const vm = buildActiveSessionHeroViewModel(baseInput);
    expect(vm.heroDensity).toBe('minimal');
    expect(vm.momentumScores).toBeNull();
    expect(vm.dailyProgress).toBeNull();
    expect(vm.showPurityScore).toBe(false);
    expect(vm.secondaryInfo).toBeNull();
  });

  it('project lane view model has secondary info when lanePresentation provided', () => {
    const vm = buildActiveSessionHeroViewModel({
      ...baseInput,
      lanePresentation: {
        animation: 'low_medium',
        copyTone: 'reflective_continuity',
        density: 'medium',
        emptyStateCta: 'Resume a project thread',
        errorStateHint: 'Keep the thread intact and retry.',
        icon: 'pen-tool',
        lane: 'deep_creative',
        loadingState: 'project_thread_skeleton',
        shouldRenderSkeleton: true,
        visualFeeling: 'studio_workbench',
      },
    });

    expect(vm.laneAccent).toBe('studio_workbench');
    expect(vm.secondaryInfo).toBe('Next move');
  });

  it('reduced motion flag propagates to view model', () => {
    const vm = buildActiveSessionHeroViewModel({
      ...baseInput,
      isReducedMotion: true,
    });

    expect(vm.isReducedMotion).toBe(true);
  });

  it('no full boss HUD at default — only timer, progress, phase', () => {
    const vm = buildActiveSessionHeroViewModel(baseInput);
    expect(vm.heroDensity).toBe('minimal');
    expect(vm.signalPill).toBeNull();
    expect(vm.momentumScores).toBeNull();
    expect(vm.dailyProgress).toBeNull();
    expect(vm.showPurityScore).toBe(false);
  });
});
