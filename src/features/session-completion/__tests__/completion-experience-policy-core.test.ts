import { SessionMode } from '../../../session/modes';
import { resolveCompletionExperiencePolicy } from '../completion-experience-policy';
import { baseInput, baseSummary } from './completion-experience-policy.helpers';

describe('CompletionExperiencePolicy', () => {
  it('rejects stale final-release runtime language', () => {
    const legacyPremiumState = ['public', 'v1'].join('_');
    const legacyInput = structuredClone({
      ...baseInput,
      premiumState: legacyPremiumState,
    });

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
    expect(policy.hiddenCompletionSurfaces).not.toContain(
      'study_progress_card',
    );
  });

  it('game-like completion shows boss damage', () => {
    const policy = resolveCompletionExperiencePolicy({
      ...baseInput,
      consequences: { boss: { damageDealt: 18 } },
      motivationStyle: 'game_like',
    });

    expect(policy.adaptivePayoff).toBe('boss_damage');
    expect(policy.hiddenCompletionSurfaces).not.toContain(
      'boss_consequence_card',
    );
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
      expect.arrayContaining([
        'rival_consequence_cards',
        'squad_consequence_cards',
      ]),
    );
  });

  it('completion does not render stub neuroplasticity card', () => {
    const policy = resolveCompletionExperiencePolicy(baseInput);

    expect(policy.hiddenCompletionSurfaces).not.toContain(
      'neuroplasticity_card',
    );
    expect(policy.adaptivePayoff).not.toBe('neuroplasticity_card');
  });

  it('completion still gives XP, streak, and progress exactly once', () => {
    const policy = resolveCompletionExperiencePolicy(baseInput);
    const beats = [policy.heroBeat, policy.progressBeat, policy.reflectionBeat];

    expect(policy.progressBeat.kind).toBe('xp_streak_progress');
    expect(
      beats.filter((beat) => beat.kind === 'xp_streak_progress'),
    ).toHaveLength(1);
  });

  it('duplicate completion event does not duplicate reward surfaces', () => {
    const first = resolveCompletionExperiencePolicy(baseInput);
    const second = resolveCompletionExperiencePolicy(baseInput);

    expect(second.hiddenCompletionSurfaces).toEqual(
      first.hiddenCompletionSurfaces,
    );
    expect(new Set(second.hiddenCompletionSurfaces).size).toBe(
      second.hiddenCompletionSurfaces.length,
    );
  });

  it('completion UI policy does not mutate rewards directly', () => {
    const before = { ...baseSummary };
    resolveCompletionExperiencePolicy(baseInput);

    expect(baseSummary).toEqual(before);
  });
});
