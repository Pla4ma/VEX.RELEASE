import { buildHomeReturnReasonState, buildHomeSpineModel } from '../service';

describe('home-spine service', () => {
  it('prioritizes coach recommendations before other return reasons', () => {
    const result = buildHomeReturnReasonState({
      activeStudyPlan: {
        completedTasks: 1,
        remainingMinutes: 45,
        title: 'Deep Work Sprint',
        totalTasks: 3,
      },
      canShowExpansionSystems: true,
      comebackMessage: 'A short session gets you back on track fast.',
      nextBestAction: {
        ctaLabel: 'Start now',
        description: 'Take the next clean rep.',
        title: 'Protect today',
      },
      primaryRecommendation: {
        id: 'rec-1',
        reasoning: 'Your strongest focus window opens in the next hour.',
        suggestedDifficulty: 'NORMAL',
        suggestedDuration: 1800,
        type: 'OPTIMAL_TIME',
      },
    });

    expect(result.source).toBe('coach');
    expect(result.intent).toBe('accept-coach-recommendation');
    expect(result.title).toBe('This is a strong time to focus');
  });

  it('surfaces the completion highlight inside the return-reason rail', () => {
    const model = buildHomeSpineModel({
      currentStreak: 6,
      homeHighlight: {
        message:
          'Home is primed with one clear move that keeps this streak easy to protect.',
        title: '6-day streak secured',
        tone: 'celebration',
      },
      isAtRisk: false,
      isFirstRun: false,
      level: 4,
      progressPercent: 35,
      progressXp: 980,
      returnReason: {
        body: 'Take the next clean rep.',
        ctaLabel: 'Start now',
        eyebrow: 'Return reason',
        intent: 'start-session',
        source: 'next-best-action',
        title: 'Protect today',
        tone: 'default',
      },
      todayFocusMinutes: 42,
    });

    expect(model.returnReason.source).toBe('completion-highlight');
    expect(model.returnReason.title).toBe('6-day streak secured');
    expect(model.returnReason.ctaLabel).toBe('Start now');
    expect(model.progressSignal.title).toContain('42');
  });

  it('uses a fast-start primary action for first-run users', () => {
    const model = buildHomeSpineModel({
      currentStreak: 0,
      homeHighlight: null,
      isAtRisk: false,
      isFirstRun: true,
      level: 1,
      progressPercent: 0,
      progressXp: 0,
      returnReason: {
        body: 'One clean rep makes VEX feel real.',
        ctaLabel: 'Start now',
        eyebrow: 'Return reason',
        intent: 'start-session',
        source: 'next-best-action',
        title: 'Start with one clean finish',
        tone: 'default',
      },
      todayFocusMinutes: 0,
    });

    expect(model.primaryAction.ctaLabel).toBe('Start first session');
    expect(model.progressSignal.title).toBe(
      'The core loop unlocks after session one',
    );
  });

  it('turns partial daily progress into a concrete next block', () => {
    const model = buildHomeSpineModel({
      currentStreak: 2,
      homeHighlight: null,
      isAtRisk: false,
      isFirstRun: false,
      level: 3,
      progressPercent: 21,
      progressXp: 420,
      returnReason: {
        body: 'Take the next clean rep.',
        ctaLabel: 'Start now',
        eyebrow: 'Return reason',
        intent: 'start-session',
        source: 'next-best-action',
        title: 'Protect today',
        tone: 'default',
      },
      todayFocusMinutes: 25,
    });

    expect(model.progressSignal.eyebrow).toBe('Daily momentum');
    expect(model.progressSignal.body).toContain('95 minutes remain');
    expect(model.progressSignal.body).toContain('25-minute block');
    expect(model.progressSignal.title).toContain('25 focus minutes');
  });

  it('shows completion as protected momentum instead of urgent work', () => {
    const model = buildHomeSpineModel({
      currentStreak: 4,
      homeHighlight: null,
      isAtRisk: false,
      isFirstRun: false,
      level: 5,
      progressPercent: 100,
      progressXp: 1200,
      returnReason: {
        body: 'Take the next clean rep.',
        ctaLabel: 'Start now',
        eyebrow: 'Return reason',
        intent: 'start-session',
        source: 'next-best-action',
        title: 'Protect today',
        tone: 'default',
      },
      todayFocusMinutes: 135,
    });

    expect(model.progressSignal.title).toBe(
      'Today already has a real focus win',
    );
    expect(model.progressSignal.body).toContain('optional extra progress');
  });
});
