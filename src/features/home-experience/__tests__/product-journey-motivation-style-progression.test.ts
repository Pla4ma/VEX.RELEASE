import { buildHomeExperienceModel } from './product-journey-helpers';

describe('product journey — motivation style progression', () => {
  it.each([
    [0, 0, 'none'],
    [1, 0, 'progress_rhythm'],
    [3, 0, 'progress_rhythm'],
    [5, 0, 'progress_rhythm'],
    [10, 0, 'progress_rhythm'],
  ] as const)(
    'calm user at %i sessions gets spotlight: %s',
    (sessions, _streak, expected) => {
      const model = buildHomeExperienceModel({
        explicitMotivationStyle: 'calm',
        totalCompletedSessions: sessions,
      });
      expect(model.spotlight).toBe(expected);
    },
  );

  it.each([
    [0, 'none'],
    [5, 'study'],
    [12, 'study'],
  ] as const)(
    'study_focused user at %i sessions gets spotlight: %s',
    (sessions, expected) => {
      const model = buildHomeExperienceModel({
        explicitMotivationStyle: 'study_focused',
        totalCompletedSessions: sessions,
      });
      expect(model.spotlight).toBe(expected);
    },
  );

  it.each([
    [0, 'none'],
    [1, 'progress_rhythm'],
    [5, 'boss_progress'],
    [12, 'boss_progress'],
  ] as const)(
    'game_like user at %i sessions gets spotlight: %s',
    (sessions, expected) => {
      const model = buildHomeExperienceModel({
        explicitMotivationStyle: 'game_like',
        totalCompletedSessions: sessions,
      });
      expect(model.spotlight).toBe(expected);
    },
  );

  it.each([
    [0, 'none'],
    [1, 'progress_rhythm'],
    [5, 'coach'],
    [12, 'coach'],
  ] as const)(
    'coach_led user at %i sessions gets spotlight: %s',
    (sessions, expected) => {
      const model = buildHomeExperienceModel({
        explicitMotivationStyle: 'coach_led',
        totalCompletedSessions: sessions,
      });
      expect(model.spotlight).toBe(expected);
    },
  );
});
