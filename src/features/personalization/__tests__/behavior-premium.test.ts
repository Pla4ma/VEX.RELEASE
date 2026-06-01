import { resolveVexExperience } from '../service';
import { available, profile, stats } from './test-fixtures';

describe('resolveVexExperience — behavior, premium & release', () => {
  it('uses behavior softly without overfitting after one session', () => {
    const oneSession = resolveVexExperience(
      profile('coach_led'),
      stats({
        completedSessionDurations: [60],
        totalCompletedSessions: 1,
      }),
      available,
    );
    const repeated = resolveVexExperience(
      profile('coach_led'),
      stats({
        completedSessionDurations: [25, 25, 30, 25],
        mostSuccessfulTimeOfDay: 'morning',
        totalCompletedSessions: 6,
      }),
      available,
    );

    expect(oneSession.sessionDefaults.duration).toBe(25);
    expect(oneSession.behaviorAdaptations).toContain('needs_more_signal');
    expect(repeated.sessionDefaults.duration).toBe(25);
    expect(repeated.sessionDefaults.copy).toContain('repeat your best rhythm');
  });

  it('delays premium until value is experienced and keeps the execution loop free', () => {
    const early = resolveVexExperience(
      profile('study_focused'),
      stats({
        totalCompletedSessions: 2,
      }),
      available,
    );
    const ready = resolveVexExperience(
      profile('study_focused'),
      stats({
        premiumFeatureAttempts: ['weekly_intelligence'],
        totalCompletedSessions: 7,
      }),
      available,
    );

    expect(early.premium.shouldTease).toBe(false);
    expect(ready.premium.shouldTease).toBe(true);
    expect(ready.premium.copy).toContain('deeper personalization');
    expect(ready.premium.mustRemainFree).toEqual(
      expect.arrayContaining([
        'start_session',
        'complete_session',
        'basic_coach',
      ]),
    );
  });

  it('defines final release as polished core with unfinished economies disabled', () => {
    const experience = resolveVexExperience(
      profile('intense'),
      stats({
        totalCompletedSessions: 20,
      }),
      available,
    );

    expect(experience.release.included).toContain('adaptive_home');
    expect(experience.release.hidden).toEqual(
      expect.arrayContaining(['shop', 'inventory', 'battle_pass', 'wagers']),
    );
    expect(experience.release.productionProof).toContain(
      'real_device_first_session_qa',
    );
  });
});
