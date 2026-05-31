import {
  buildViewModel,
  renderHero,
  hasText,
} from './active-session-focus-sanctuary.helpers';

describe('ActiveSessionHero sanctuary > basic rendering', () => {
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
});
