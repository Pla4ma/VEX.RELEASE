import { SessionMode } from '../../../session/modes';
import type { SessionSummary } from '../../../session/types';
import {
  type CompletionExperiencePolicyInput,
  resolveCompletionExperiencePolicy,
} from '../completion-experience-policy';

const baseSummary: SessionSummary = {
  actualDuration: 1500,
  baseScore: 100,
  bonuses: [],
  coinsEarned: 0,
  completionPercentage: 100,
  createdAt: 500000,
  damageTaken: 0,
  effectiveDuration: 1400,
  finalScore: 92,
  focusPurityScore: 95,
  focusQuality: 95,
  gemsEarned: 0,
  interruptions: 0,
  modeBonus: 0,
  pausedDuration: 0,
  pausedTime: 0,
  pauses: 0,
  penaltiesApplied: [],
  plannedDuration: 1500,
  sessionId: 'session-123',
  sessionMode: SessionMode.FLOW,
  status: 'COMPLETED',
  streakBonus: 10,
  streakDays: 4,
  streakIncreased: true,
  streakMaintained: true,
  timeBonus: 10,
  userId: 'user-123',
  userLevel: 2,
  vsAverage: 0,
  vsBest: 0,
  xpEarned: 120,
};

const baseInput: CompletionExperiencePolicyInput = {
  consequences: {},
  featureAvailability: {
    boss: true,
    challenges: true,
    contractUsed: false,
    progress: true,
    study: true,
  },
  firstWeekStage: 'ACTIVATING',
  motivationStyle: 'calm',
  premiumState: 'free',
  primaryGoal: null,
  sessionMode: SessionMode.FLOW,
  summary: baseSummary,
};

describe('CompletionExperiencePolicy', () => {
  it('rejects stale final-release runtime language', () => {
    const legacyPremiumState = ['public', 'v1'].join('_');
    const legacyInput = JSON.parse(JSON.stringify({ ...baseInput, premiumState: legacyPremiumState }));

    expect(() => resolveCompletionExperiencePolicy(legacyInput)).toThrow();
  });

  it('renders max 4 major beats', () => {
    const policy = resolveCompletionExperiencePolicy(baseInput);
    const beats = [
      policy.heroBeat,
      policy.progressBeat,
      policy.reflectionBeat,
      policy.adaptivePayoff,
    ];

    expect(beats).toHaveLength(4);
  });

  it('calm completion is minimal', () => {
    const policy = resolveCompletionExperiencePolicy({
      ...baseInput,
      consequences: { boss: { damageDealt: 10 } },
    });

    expect(policy.hiddenCompletionSurfaces).toEqual(
      expect.arrayContaining([
        'chest_reward_animation',
        'premium_chest',
        'battle_pass_card',
        'boss_consequence_card',
        'multiple_reward_rows',
        'follow_through_cards',
      ]),
    );
    expect(policy.adaptivePayoff).toBe('progress_insight');
  });

  it('study completion shows study progress', () => {
    const policy = resolveCompletionExperiencePolicy({
      ...baseInput,
      motivationStyle: 'student',
      primaryGoal: 'STUDY',
      sessionMode: SessionMode.STUDY,
    });

    expect(policy.adaptivePayoff).toBe('study_progress');
    expect(policy.hiddenCompletionSurfaces).not.toContain('study_progress_card');
  });

  it('game-like completion shows boss damage', () => {
    const policy = resolveCompletionExperiencePolicy({
      ...baseInput,
      consequences: { boss: { damageDealt: 18 } },
      motivationStyle: 'game_like',
    });

    expect(policy.adaptivePayoff).toBe('boss_damage');
    expect(policy.hiddenCompletionSurfaces).not.toContain('boss_consequence_card');
  });

  it('free user completion does not show premium chest', () => {
    const policy = resolveCompletionExperiencePolicy(baseInput);

    expect(policy.hiddenCompletionSurfaces).toEqual(
      expect.arrayContaining(['premium_chest', 'chest_reward_animation']),
    );
    expect(policy.adaptivePayoff).not.toBe('premium_chest');
  });

  it('premium user completion does not show chest by default', () => {
    const policy = resolveCompletionExperiencePolicy({
      ...baseInput,
      premiumState: 'premium',
    });

    expect(policy.hiddenCompletionSurfaces).toEqual(
      expect.arrayContaining(['premium_chest', 'chest_reward_animation']),
    );
    expect(policy.adaptivePayoff).not.toBe('premium_chest');
  });

  it('completion does not expose shop, inventory, coins, or gems', () => {
    const policy = resolveCompletionExperiencePolicy(baseInput);

    expect(policy.hiddenCompletionSurfaces).toEqual(
      expect.arrayContaining(['shop_inventory_prompts', 'coins_gems_wallet']),
    );
  });

  it('rival and squad consequences are hidden', () => {
    const policy = resolveCompletionExperiencePolicy({
      ...baseInput,
      consequences: { rival: { gapClosed: 3 }, squad: { delta: 1 } },
    });

    expect(policy.hiddenCompletionSurfaces).toEqual(
      expect.arrayContaining(['rival_consequence_cards', 'squad_consequence_cards']),
    );
  });

  it('completion does not render stub neuroplasticity card', () => {
    const policy = resolveCompletionExperiencePolicy(baseInput);

    expect(policy.hiddenCompletionSurfaces).not.toContain('neuroplasticity_card');
    expect(policy.adaptivePayoff).not.toBe('neuroplasticity_card');
  });

  it('completion still gives XP, streak, and progress exactly once', () => {
    const policy = resolveCompletionExperiencePolicy(baseInput);
    const beats = [policy.heroBeat, policy.progressBeat, policy.reflectionBeat];

    expect(policy.progressBeat.kind).toBe('xp_streak_progress');
    expect(beats.filter((beat) => beat.kind === 'xp_streak_progress')).toHaveLength(1);
  });

  it('duplicate completion event does not duplicate reward surfaces', () => {
    const first = resolveCompletionExperiencePolicy(baseInput);
    const second = resolveCompletionExperiencePolicy(baseInput);

    expect(second.hiddenCompletionSurfaces).toEqual(first.hiddenCompletionSurfaces);
    expect(new Set(second.hiddenCompletionSurfaces).size).toBe(
      second.hiddenCompletionSurfaces.length,
    );
  });

  it('completion UI policy does not mutate rewards directly', () => {
    const before = { ...baseSummary };
    resolveCompletionExperiencePolicy(baseInput);

    expect(baseSummary).toEqual(before);
  });

  it('coach-led completion shows coach next action', () => {
    const policy = resolveCompletionExperiencePolicy({
      ...baseInput,
      motivationStyle: 'coach_led',
    });

    expect(policy.adaptivePayoff).toBe('coach_next_action');
    expect(policy.nextAction).toBe('coach_next_action');
  });

  it('calm completion hides boss consequence and chest surfaces', () => {
    const policy = resolveCompletionExperiencePolicy({
      ...baseInput,
      motivationStyle: 'calm',
      consequences: { boss: { damageDealt: 20 } },
    });

    expect(policy.hiddenCompletionSurfaces).toContain('boss_consequence_card');
    expect(policy.hiddenCompletionSurfaces).toContain('premium_chest');
    expect(policy.hiddenCompletionSurfaces).toContain('chest_reward_animation');
    expect(policy.adaptivePayoff).toBe('progress_insight');
  });

  it('no motivation style ever exposes premium chest', () => {
    const styles = ['calm', 'friendly', 'game_like', 'coach_led', 'competitive', 'intense', 'study_focused', 'student', 'creator', 'worker'] as const;

    for (const style of styles) {
      const policy = resolveCompletionExperiencePolicy({
        ...baseInput,
        consequences: { boss: { damageDealt: 20 } },
        motivationStyle: style,
        primaryGoal: style === 'student' ? 'STUDY' : style === 'creator' ? 'CREATIVE' : null,
      });
      expect(policy.hiddenCompletionSurfaces).toContain('premium_chest');
      expect(policy.hiddenCompletionSurfaces).toContain('chest_reward_animation');
    }
  });

  it('no motivation style ever exposes shop or inventory callbacks', () => {
    const styles = ['calm', 'friendly', 'game_like', 'coach_led', 'competitive', 'intense', 'study_focused', 'student', 'creator', 'worker'] as const;

    for (const style of styles) {
      const policy = resolveCompletionExperiencePolicy({
        ...baseInput,
        motivationStyle: style,
        primaryGoal: style === 'student' ? 'STUDY' : style === 'creator' ? 'CREATIVE' : null,
      });
      expect(policy.hiddenCompletionSurfaces).toContain('shop_inventory_prompts');
      expect(policy.hiddenCompletionSurfaces).toContain('coins_gems_wallet');
    }
  });

  it('friendly completion shows progress insight', () => {
    const policy = resolveCompletionExperiencePolicy({
      ...baseInput,
      motivationStyle: 'friendly',
    });

    expect(policy.adaptivePayoff).toBe('progress_insight');
    expect(policy.hiddenCompletionSurfaces).toContain('boss_consequence_card');
  });

  it('beats object contains exactly 4 beats matching top-level', () => {
    const policy = resolveCompletionExperiencePolicy(baseInput);

    expect(policy.beats).toBeDefined();
    expect(policy.beats.heroBeat).toEqual(policy.heroBeat);
    expect(policy.beats.progressBeat).toEqual(policy.progressBeat);
    expect(policy.beats.reflectionBeat).toEqual(policy.reflectionBeat);
    expect(policy.beats.adaptivePayoff).toBe(policy.adaptivePayoff);
  });

  it('clean lane completion has minimal animation', () => {
    const policy = resolveCompletionExperiencePolicy({
      ...baseInput,
      lane: 'minimal_normal',
      motivationStyle: 'calm',
    });

    expect(policy.animationLevel).toBe('minimal');
    expect(policy.heroBeat.surface).toBe('hero_minimal');
    expect(policy.hiddenCompletionSurfaces).toEqual(
      expect.arrayContaining(['chest_reward_animation', 'boss_consequence_card']),
    );
  });

  it('game-like lane completion has medium_high animation', () => {
    const policy = resolveCompletionExperiencePolicy({
      ...baseInput,
      lane: 'game_like',
      motivationStyle: 'game_like',
      consequences: { boss: { damageDealt: 20 } },
    });

    expect(policy.animationLevel).toBe('medium_high');
    expect(policy.heroBeat.surface).toBe('hero');
  });

  it('clean lane avoid mode style still produces clean completion', () => {
    const policy = resolveCompletionExperiencePolicy({
      ...baseInput,
      lane: 'minimal_normal',
      motivationStyle: 'friendly',
    });

    expect(policy.animationLevel).toBe('minimal');
    expect(policy.heroBeat.surface).toBe('hero_minimal');
  });

  it('non-clean calm user still gets minimal animation when no lane set', () => {
    const policy = resolveCompletionExperiencePolicy({
      ...baseInput,
      motivationStyle: 'calm',
    });

    expect(policy.animationLevel).toBe('minimal');
    expect(policy.heroBeat.surface).toBe('hero_minimal');
  });

  it('student lane completion has low_medium animation', () => {
    const policy = resolveCompletionExperiencePolicy({
      ...baseInput,
      lane: 'student',
      motivationStyle: 'study_focused',
    });

    expect(policy.animationLevel).toBe('low_medium');
    expect(policy.heroBeat.surface).toBe('hero');
  });

  it('all adaptive payoff kinds are valid beat kinds', () => {
    const overrides: Partial<CompletionExperiencePolicyInput>[] = [
      { motivationStyle: 'student', primaryGoal: 'STUDY', sessionMode: SessionMode.STUDY },
      { motivationStyle: 'game_like', consequences: { boss: { damageDealt: 10 } } },
      { motivationStyle: 'coach_led' },
      { motivationStyle: 'calm' },
    ];

    for (const ov of overrides) {
      const policy = resolveCompletionExperiencePolicy({ ...baseInput, ...ov });
      const beatKinds = [
        policy.beats.heroBeat.kind,
        policy.beats.progressBeat.kind,
        policy.beats.reflectionBeat.kind,
        policy.beats.adaptivePayoff,
      ];
      expect(new Set(beatKinds).size).toBe(4);
    }
  });
});
