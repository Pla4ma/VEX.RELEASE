import type {} from '../completion-experience-policy';
import { resolveCompletionExperiencePolicy } from '../completion-experience-policy';
import { baseInput } from './completion-experience-policy.helpers';

describe('CompletionExperiencePolicy — motivation styles', () => {
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
    const styles = [
      'calm',
      'friendly',
      'game_like',
      'coach_led',
      'competitive',
      'intense',
      'study_focused',
      'student',
      'creator',
      'worker',
    ] as const;

    for (const style of styles) {
      const policy = resolveCompletionExperiencePolicy({
        ...baseInput,
        consequences: { boss: { damageDealt: 20 } },
        motivationStyle: style,
        primaryGoal:
          style === 'student'
            ? 'STUDY'
            : style === 'creator'
              ? 'CREATIVE'
              : null,
      });
      expect(policy.hiddenCompletionSurfaces).toContain('premium_chest');
      expect(policy.hiddenCompletionSurfaces).toContain(
        'chest_reward_animation',
      );
    }
  });

  it('no motivation style ever exposes shop or inventory callbacks', () => {
    const styles = [
      'calm',
      'friendly',
      'game_like',
      'coach_led',
      'competitive',
      'intense',
      'study_focused',
      'student',
      'creator',
      'worker',
    ] as const;

    for (const style of styles) {
      const policy = resolveCompletionExperiencePolicy({
        ...baseInput,
        motivationStyle: style,
        primaryGoal:
          style === 'student'
            ? 'STUDY'
            : style === 'creator'
              ? 'CREATIVE'
              : null,
      });
      expect(policy.hiddenCompletionSurfaces).toContain(
        'shop_inventory_prompts',
      );
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
});
