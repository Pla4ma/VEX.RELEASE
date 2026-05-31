import { resolveBehavior } from '../experience-service-helpers';
import { makeStats } from './personalization.helpers';
import * as fixtures from './test-fixtures';

jest.mock('@sentry/react-native', () => ({
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
}));

jest.mock('../../../persistence/MMKVStorageAdapter', () => ({
  getMMKVStorageAdapter: () => ({
    getItem: jest.fn(() => null),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  }),
}));

describe('resolveBehavior', () => {
  it('returns needs_more_signal for < 3 completed sessions', () => {
    const result = resolveBehavior(
      fixtures.profile('calm'),
      makeStats({ completedSessionDurations: [25, 25] }),
    );
    expect(result.adaptations).toContain('needs_more_signal');
    expect(result.duration).toBe(25);
  });
  it('picks most frequent duration when enough sessions', () => {
    const result = resolveBehavior(
      fixtures.profile('calm'),
      makeStats({ completedSessionDurations: [25, 50, 50, 50] }),
    );
    expect(result.duration).toBe(50);
    expect(result.adaptations).toContain('duration_pattern');
  });
  it('includes time_of_day_pattern when mostSuccessfulTimeOfDay is set', () => {
    const result = resolveBehavior(
      fixtures.profile('calm'),
      makeStats({
        completedSessionDurations: [25, 25, 25],
        mostSuccessfulTimeOfDay: 'morning',
      }),
    );
    expect(result.adaptations).toContain('time_of_day_pattern');
    expect(result.sessionSuggestion).toContain('morning');
  });
  it('includes abandonment_aware when abandonedSessionDurations exist', () => {
    const result = resolveBehavior(
      fixtures.profile('calm'),
      makeStats({
        completedSessionDurations: [25, 25, 25],
        abandonedSessionDurations: [15],
      }),
    );
    expect(result.adaptations).toContain('abandonment_aware');
  });
  it('includes study_heavy when studyUsageRatio >= 0.5', () => {
    const result = resolveBehavior(
      fixtures.profile('calm'),
      makeStats({
        completedSessionDurations: [25, 25, 25],
        studyUsageRatio: 0.6,
      }),
    );
    expect(result.adaptations).toContain('study_heavy');
  });
});
