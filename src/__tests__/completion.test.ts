import { experience, accessFor, assertCoreAvailable } from './debloat-test-helpers';
import { getFeatureAvailability } from '../features/liveops-config/feature-access';

describe('Group 4 — Completion', () => {
  it('4a: max 4 major beats in completion sequence', () => {
    const exp = experience('coach_led', { totalCompletedSessions: 5 });

    const sequence = exp.completionSequence;
    expect(sequence.length).toBeLessThanOrEqual(6);

    const majorBeats = sequence.filter(
      (s: string) => !['quiet_xp', 'next_action'].includes(s),
    );
    expect(majorBeats.length).toBeLessThanOrEqual(4);
  });

  it('4b: calm completion is minimal', () => {
    const exp = experience('calm', { totalCompletedSessions: 3 });

    expect(exp.completionSequence).toContain('core_saved');
    expect(exp.completionSequence).toContain('coach_companion_reflection');
    expect(exp.completionSequence).not.toContain('boss_effect');
  });

  it('4c: study completion shows study next step', () => {
    const exp = experience('study_focused', {
      studyUsageRatio: 0.7,
      totalCompletedSessions: 6,
    });

    expect(exp.completionSequence).toContain('study_progress');
    expect(exp.completionSequence).toContain('next_action');
  });

  it('4d: game-like completion shows boss damage reveal', () => {
    const exp = experience('game_like', {
      bossChallengeEngagement: 'high',
      completedSessionDurations: [25, 30, 25],
      totalCompletedSessions: 8,
    });

    expect(exp.completionSequence).toContain('boss_effect');
    expect(exp.boss.completionEffect).toBe('session_damage');
  });

  it('4e: no battle pass in completion', () => {
    const exp = experience('intense', { totalCompletedSessions: 20 });

    expect(exp.completionSequence).not.toContain('battle_pass_reward');
    expect(exp.homeSections).not.toContain('battle_pass');
    expect(exp.hiddenSystems).toContain('battle_pass');
  });

  it('4f: no coins/gems/shop in completion', () => {
    const exp = experience('game_like', { totalCompletedSessions: 15 });

    expect(exp.hiddenSystems).toContain('shop');
    expect(exp.hiddenSystems).toContain('inventory');
    expect(exp.completionSequence).not.toContain('shop_unlock');
    expect(exp.completionSequence).not.toContain('coins_reward');
  });

  it('4g: no rival/squad consequence in completion', () => {
    const exp = experience('game_like', { totalCompletedSessions: 30 });

    expect(exp.completionSequence).not.toContain('rival_result');
    expect(exp.completionSequence).not.toContain('squad_bonus');
    expect(exp.hiddenSystems).toContain('rivals');
    expect(exp.hiddenSystems).toContain('squads');
  });

  it('4h: XP/streak/progress still update', () => {
    const exp = experience('study_focused', {
      completionStreak: 5,
      totalCompletedSessions: 10,
    });

    expect(exp.completionSequence).toContain('core_saved');
    expect(exp.completionSequence).toContain('streak_progress');

    const core = accessFor(10);
    assertCoreAvailable(core, 'progress_view');
    expect(getFeatureAvailability(core.economy_basic).canRenderEntryPoint).toBe(false);
  });
});
