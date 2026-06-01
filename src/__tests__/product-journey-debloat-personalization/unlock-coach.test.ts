/**
 * Test Group 5 — Progressive Unlock Runtime
 * Test Group 6 — Coach
 */

import { getFeatureAvailability } from '../../features/liveops-config/feature-access';
import { experience, accessFor, HIDDEN_FEATURE_KEYS } from './helpers';

describe('Group 5 — Progressive Unlock Runtime', () => {
  it('5a: locked features do not query', () => {
    HIDDEN_FEATURE_KEYS.forEach((key) => {
      const a = getFeatureAvailability(accessFor(0)[key]);
      expect(a.canQuery).toBe(false);
    });

    HIDDEN_FEATURE_KEYS.forEach((key) => {
      const a = getFeatureAvailability(accessFor(999)[key]);
      expect(a.canQuery).toBe(false);
    });
  });

  it('5b: locked features do not subscribe', () => {
    HIDDEN_FEATURE_KEYS.forEach((key) => {
      const a = getFeatureAvailability(accessFor(0)[key]);
      expect(a.canSubscribeToEvents).toBe(false);
    });
  });

  it('5c: locked features do not notify', () => {
    HIDDEN_FEATURE_KEYS.forEach((key) => {
      const a = getFeatureAvailability(accessFor(0)[key]);
      expect(a.canShowNotification).toBe(false);
    });
  });

  it('5d: hidden features do not route (navigation disabled)', () => {
    HIDDEN_FEATURE_KEYS.forEach((key) => {
      const a = getFeatureAvailability(accessFor(5)[key]);
      expect(a.canNavigate).toBe(false);
      expect(a.canRegisterRoute).toBe(false);
    });
  });

  it('5e: hidden features do not render entry points', () => {
    HIDDEN_FEATURE_KEYS.forEach((key) => {
      const a = getFeatureAvailability(accessFor(0)[key]);
      expect(a.canRenderEntryPoint).toBe(false);
    });
  });
});

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

    expect(exp.coachMessageStyle).toBe('reflective_prompt');
    expect(exp.hiddenSystems).toContain('shop');
    expect(exp.completionSequence).not.toContain('coach_interruption');
  });

  it('6d: coach copy adapts by motivation style', () => {
    const studyExp = experience('study_focused');
    expect(studyExp.coachMessageStyle).toBe('study_guide');
    expect(studyExp.studyLayerLabel).toBe('Study OS');

    const intenseExp = experience('intense');
    expect(intenseExp.coachTone).toBe('direct');
    expect(intenseExp.coachMessageStyle).toBe('direct_tactical');

    const gameExp = experience('game_like');
    expect(gameExp.coachMessageStyle).toBe('game_companion');

    const calmExp = experience('calm');
    expect(calmExp.coachMessageStyle).toBe('reflective_prompt');

    const coachExp = experience('coach_led');
    expect(coachExp.coachMessageStyle).toBe('gentle_mentor');
  });
});
