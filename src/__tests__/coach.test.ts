import { experience } from './debloat-test-helpers';

describe('Group 6 — Coach', () => {
  it('6a: Day 0 coach does not fake memory', () => {
    const exp = experience('coach_led');

    expect(exp.behaviorAdaptations).toContain('needs_more_signal');
    expect(exp.sessionDefaults.copy).toContain('default');
    expect(exp.coachTone).toBe('soft');
  });

  it('6b: after session 1 coach references real session', () => {
    const exp = experience('coach_led', {
      completedSessionDurations: [60],
      totalCompletedSessions: 1,
    });

    expect(exp.behaviorAdaptations).toContain('needs_more_signal');
    expect(exp.sessionDefaults.duration).toBe(25);

    const multi = experience('coach_led', {
      completedSessionDurations: [25, 25, 30, 25],
      totalCompletedSessions: 6,
    });
    expect(multi.behaviorAdaptations).toContain('duration_pattern');
    expect(multi.sessionDefaults.copy).toContain('best rhythm');
  });

  it('6c: coach does not interrupt active focus', () => {
    const exp = experience('calm');

    expect(exp.coachMessageStyle).toBe('reflection');
    expect(exp.hiddenSystems).toContain('shop');
    expect(exp.completionSequence).not.toContain('coach_interruption');
  });

  it('6d: coach copy adapts by motivation style', () => {
    const studyExp = experience('study_focused');
    expect(studyExp.coachMessageStyle).toBe('study_tutor');
    expect(studyExp.studyLayerLabel).toBe('Study OS');

    const intenseExp = experience('intense');
    expect(intenseExp.coachTone).toBe('direct');
    expect(intenseExp.coachMessageStyle).toBe('tactical');

    const gameExp = experience('game_like');
    expect(gameExp.coachMessageStyle).toBe('game_guide');

    const calmExp = experience('calm');
    expect(calmExp.coachMessageStyle).toBe('reflection');

    const coachExp = experience('coach_led');
    expect(coachExp.coachMessageStyle).toBe('mentor');
  });
});
