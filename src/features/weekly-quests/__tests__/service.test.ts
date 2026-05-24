import {
  applyWeeklyQuestSession,
  createInitialWeeklyQuestState,
  getWeekKey,
} from '../service';

const completedAt = new Date('2026-04-29T12:00:00-04:00').getTime();

describe('weekly quest service', () => {
  it('creates a deterministic weekly quest chain', () => {
    const state = createInitialWeeklyQuestState('user-1', completedAt);

    expect(state.weekKey).toBe(getWeekKey(completedAt));
    expect(state.steps).toHaveLength(7);
    expect(state.completedAt).toBeNull();
  });

  it('records session count, grade, boss damage, mode, streak, item, and boss defeat progress', () => {
    const state = createInitialWeeklyQuestState('user-1', completedAt);
    const next = applyWeeklyQuestSession(state, {
      userId: 'user-1',
      completedAt,
      sessionMode: 'STUDY',
      finalScore: 92,
      bossDamage: 240,
      streakDays: 6,
      usedSessionItem: true,
      bossDefeated: true,
    });

    expect(next.steps.find((step) => step.id === 'complete_three_sessions')?.progress).toBe(1);
    expect(next.steps.find((step) => step.id === 'earn_two_a_grades')?.progress).toBe(1);
    expect(next.steps.find((step) => step.id === 'deal_boss_damage')?.progress).toBe(240);
    expect(next.steps.find((step) => step.id === 'complete_study_session')?.completed).toBe(true);
    expect(next.steps.find((step) => step.id === 'maintain_five_day_streak')?.completed).toBe(true);
    expect(next.steps.find((step) => step.id === 'use_session_item')?.completed).toBe(true);
    expect(next.steps.find((step) => step.id === 'defeat_boss')?.completed).toBe(true);
  });

  it('arms a legendary boost only when every step is complete', () => {
    let state = createInitialWeeklyQuestState('user-1', completedAt);
    state = applyWeeklyQuestSession(state, {
      userId: 'user-1',
      completedAt,
      sessionMode: 'STUDY',
      finalScore: 95,
      bossDamage: 500,
      streakDays: 5,
      usedSessionItem: true,
      bossDefeated: true,
    });
    state = applyWeeklyQuestSession(state, {
      userId: 'user-1',
      completedAt: completedAt + 1,
      sessionMode: 'DEEP_WORK',
      finalScore: 90,
      bossDamage: 0,
      streakDays: 5,
      usedSessionItem: false,
      bossDefeated: false,
    });
    state = applyWeeklyQuestSession(state, {
      userId: 'user-1',
      completedAt: completedAt + 2,
      sessionMode: 'LIGHT_FOCUS',
      finalScore: 80,
      bossDamage: 0,
      streakDays: 5,
      usedSessionItem: false,
      bossDefeated: false,
    });

    expect(state.completedAt).toBe(completedAt + 2);
    expect(state.legendaryBoostArmed).toBe(true);
  });
});
