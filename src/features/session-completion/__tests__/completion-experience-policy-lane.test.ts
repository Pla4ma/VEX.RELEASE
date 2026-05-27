import { SessionMode } from '../../../session/modes';
import type { CompletionExperiencePolicyInput } from '../completion-experience-policy';
import { resolveCompletionExperiencePolicy } from '../completion-experience-policy';
import { baseInput } from './completion-experience-policy.helpers';

describe('CompletionExperiencePolicy — lane animations', () => {
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
