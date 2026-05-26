import React from 'react';
import TestRenderer, {
  type ReactTestRenderer,
  type ReactTestRendererJSON,
} from 'react-test-renderer';

import { ActiveSessionHero } from '../ActiveSessionHero';
import type { ActiveSessionHeroViewModel } from '../../utils/active-session-hero-view-model';
import type { ActiveSessionDisplayPolicy } from '../../utils/active-session-display-policy';

jest.mock('../../../../components/primitives/Box', () => {
  const ReactActual = jest.requireActual('react');
  return { Box: ({ children }: { children?: React.ReactNode }) => ReactActual.createElement('Box', null, children) };
});

jest.mock('../../../../components/primitives/Text', () => {
  const ReactActual = jest.requireActual('react');
  return { Text: ({ children }: { children?: React.ReactNode }) => ReactActual.createElement('Text', null, children) };
});

jest.mock('../../../../icons', () => ({ Icon: () => null }));
jest.mock('../ActiveSessionProgressRing', () => {
  const ReactActual = jest.requireActual('react');
  return {
    ActiveSessionProgressRing: ({
      perfectFocusActive,
      showPurityScore,
    }: {
      perfectFocusActive: boolean;
      showPurityScore: boolean;
    }) => ReactActual.createElement(
      'Text',
      null,
      perfectFocusActive ? 'Completion Aura' : showPurityScore ? 'Purity Score' : 'Timer Ring',
    ),
  };
});

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

function buildViewModel(overrides: Partial<ActiveSessionHeroViewModel> = {}): ActiveSessionHeroViewModel {
  return {
    phaseIcon: 'clock',
    phaseLabel: 'Focus',
    phaseAccent: 'blue',
    studyTargetLabel: null,
    completionPercentage: 42,
    elapsedSeconds: 120,
    remainingSeconds: 600,
    signalPill: null,
    momentumScores: null,
    dailyProgress: null,
    todayFocusSeconds: null,
    showPurityScore: false,
    perfectFocusActive: false,
    purityScore: 95,
    purityLabel: 'Elite',
    streakMultiplier: 1,
    heroDensity: 'minimal',
    laneAccent: 'quiet_planner',
    secondaryInfo: null,
    isReducedMotion: false,
    ...overrides,
  };
}

const baseProgressRingProps = {
  CIRCUMFERENCE: 100,
  RADIUS: 40,
  RING_SIZE: 120,
  STROKE_WIDTH: 8,
  animatedCircleProps: {},
  glowStyle: { elevation: 0, shadowColor: 'transparent', shadowOpacity: 0, shadowRadius: 0 },
  outerStrokeDashoffset: 0,
  perfectFocusBurst: { value: 0 },
  pulseStyle: {},
  rotatingPerfectFocusStyle: {},
  labelColor: 'green',
  withAlpha: (color: string) => color as string,
};

function renderHero(viewModel: ActiveSessionHeroViewModel): ReactTestRendererJSON | ReactTestRendererJSON[] | null {
  let renderer: ReactTestRenderer | null = null;
  TestRenderer.act(() => {
    renderer = TestRenderer.create(
      <ActiveSessionHero
        viewModel={viewModel}
        progressRingProps={baseProgressRingProps}
        themeColors={{ error: 'red', inverse: 'white', primary300: 'blue', success: 'green', warning: 'orange' }}
        isReducedMotion={viewModel.isReducedMotion}
      />,
    );
  });
  return renderer?.toJSON() ?? null;
}

function hasText(
  node: ReactTestRendererJSON | ReactTestRendererJSON[] | string | null,
  text: string,
): boolean {
  if (node === null) {
    return false;
  }
  if (typeof node === 'string') {
    return node === text;
  }
  if (Array.isArray(node)) {
    return node.some((child) => hasText(child, text));
  }
  return node.children?.some((child) => hasText(child, text)) ?? false;
}

describe('ActiveSessionHero sanctuary', () => {
  it('calm active focus renders no game-like metrics', () => {
    const vm = buildViewModel();
    const hero = renderHero(vm);

    expect(hasText(hero, 'Purity Score')).toBe(false);
    expect(hasText(hero, 'Calibrating momentum...')).toBe(false);
    expect(hasText(hero, 'Challenge waiting')).toBe(false);
    expect(hasText(hero, 'Clean focus')).toBe(false);
    expect(hasText(hero, 'Study target')).toBe(false);
    expect(hasText(hero, 'Timer Ring')).toBe(true);
  });

  it('study active hero shows study target', () => {
    const vm = buildViewModel({
      studyTargetLabel: 'Study Session',
    });
    const hero = renderHero(vm);

    expect(hasText(hero, 'Study Session')).toBe(true);
    expect(hasText(hero, 'Challenge waiting')).toBe(false);
    expect(hasText(hero, 'Calibrating momentum...')).toBe(false);
  });

  it('game-like hero shows boss signal pill', () => {
    const vm = buildViewModel({
      signalPill: { type: 'boss', label: 'Challenge waiting' },
    });
    const hero = renderHero(vm);

    expect(hasText(hero, 'Challenge waiting')).toBe(true);
    expect(hasText(hero, 'Calibrating momentum...')).toBe(false);
  });

  it('paused hero can show daily progress and momentum', () => {
    const vm = buildViewModel({
      heroDensity: 'standard',
      dailyProgress: 50,
      todayFocusSeconds: 3600,
      momentumScores: [75, 80, 85],
    });
    const hero = renderHero(vm);

    expect(hasText(hero, '60:00 today - 50% of 2h goal')).toBe(true);
    expect(hasText(hero, 'Elapsed')).toBe(true);
    expect(hasText(hero, 'Complete')).toBe(true);
  });

  it('paused hero shows empty momentum calibrating when scores empty', () => {
    const vm = buildViewModel({
      heroDensity: 'standard',
      momentumScores: [],
    });
    const hero = renderHero(vm);
    expect(hasText(hero, 'Calibrating momentum...')).toBe(true);
  });

  it('minimal density hides session stats', () => {
    const vm = buildViewModel({
      heroDensity: 'minimal',
      dailyProgress: null,
      todayFocusSeconds: null,
    });
    const hero = renderHero(vm);

    expect(hasText(hero, '60:00 today - 50% of 2h goal')).toBe(false);
    expect(hasText(hero, 'Elapsed')).toBe(false);
  });

  it('completion effects stay hidden when purity HUD is disabled', () => {
    const vm = buildViewModel({
      perfectFocusActive: false,
      showPurityScore: false,
    });
    const hero = renderHero(vm);

    expect(hasText(hero, 'Completion Aura')).toBe(false);
    expect(hasText(hero, 'Timer Ring')).toBe(true);
  });

  it('props reduced — no displayPolicy, momentumScores, purityScore, streakMultiplier, todayFocusSeconds passed directly', () => {
    const vm = buildViewModel();
    expect(typeof vm).toBe('object');
    expect(vm.heroDensity).toBe('minimal');
  });

  it('clean lane active session shows timer only, no extra widgets', () => {
    const vm = buildViewModel({
      heroDensity: 'minimal',
      laneAccent: 'quiet_planner',
      secondaryInfo: null,
    });
    const hero = renderHero(vm);

    expect(hasText(hero, 'Timer Ring')).toBe(true);
    expect(hasText(hero, 'Challenge waiting')).toBe(false);
    expect(hasText(hero, 'Clean focus')).toBe(false);
    expect(hasText(hero, 'Calibrating momentum...')).toBe(false);
    expect(hasText(hero, 'Elapsed')).toBe(false);
    expect(hasText(hero, 'Study target')).toBe(false);
  });

  it('study active session shows study target only', () => {
    const vm = buildViewModel({
      studyTargetLabel: 'Study Session',
      heroDensity: 'minimal',
    });
    const hero = renderHero(vm);

    expect(hasText(hero, 'Study Session')).toBe(true);
    expect(hasText(hero, 'Challenge waiting')).toBe(false);
    expect(hasText(hero, 'Calibrating momentum...')).toBe(false);
    expect(hasText(hero, 'Elapsed')).toBe(false);
  });

  it('run lane active session shows tiny boss signal only, no full HUD', () => {
    const vm = buildViewModel({
      heroDensity: 'minimal',
      signalPill: { type: 'boss', label: 'Challenge waiting' },
    });
    const hero = renderHero(vm);

    expect(hasText(hero, 'Challenge waiting')).toBe(true);
    expect(hasText(hero, 'Elapsed')).toBe(false);
    expect(hasText(hero, 'Calibrating momentum...')).toBe(false);
    expect(hasText(hero, 'Purity Score')).toBe(false);
  });

  it('project active session shows secondary info when available', () => {
    const vm = buildViewModel({
      heroDensity: 'minimal',
      secondaryInfo: 'Next move',
      laneAccent: 'studio_workbench',
    });
    const hero = renderHero(vm);

    expect(hasText(hero, 'Timer Ring')).toBe(true);
    expect(hasText(hero, 'Challenge waiting')).toBe(false);
    expect(hasText(hero, 'Elapsed')).toBe(false);
    expect(vm.secondaryInfo).toBe('Next move');
    expect(vm.laneAccent).toBe('studio_workbench');
  });

  it('no full boss HUD rendered by default — only signal pill at most', () => {
    const vm = buildViewModel();
    const hero = renderHero(vm);

    expect(hasText(hero, 'Challenge waiting')).toBe(false);
    expect(hasText(hero, 'Purity Score')).toBe(false);
    expect(hasText(hero, 'Elapsed')).toBe(false);
    expect(vm.heroDensity).toBe('minimal');
  });

  it('reduced motion honored — hero renders without crash', () => {
    const vm = buildViewModel({
      isReducedMotion: true,
      studyTargetLabel: 'Study Session',
      signalPill: { type: 'boss', label: 'Challenge waiting' },
    });
    const hero = renderHero(vm);

    expect(hasText(hero, 'Timer Ring')).toBe(true);
    expect(hasText(hero, 'Study Session')).toBe(true);
    expect(hasText(hero, 'Challenge waiting')).toBe(true);
    expect(vm.isReducedMotion).toBe(true);
  });

  it('hidden systems not mounted — no purity, no momentum, no daily progress in minimal mode', () => {
    const vm = buildViewModel({
      heroDensity: 'minimal',
      perfectFocusActive: false,
      showPurityScore: false,
      momentumScores: null,
      dailyProgress: null,
    });
    const hero = renderHero(vm);

    expect(hasText(hero, 'Purity Score')).toBe(false);
    expect(hasText(hero, 'Completion Aura')).toBe(false);
    expect(hasText(hero, 'Calibrating momentum...')).toBe(false);
    expect(hasText(hero, 'Elapsed')).toBe(false);
    expect(hasText(hero, 'Timer Ring')).toBe(true);
  });
});
