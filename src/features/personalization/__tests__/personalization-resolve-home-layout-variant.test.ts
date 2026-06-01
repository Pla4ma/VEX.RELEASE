import { resolveHomeLayoutVariant } from '../experience-resolvers';
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

describe('resolveHomeLayoutVariant', () => {
  it("returns 'study_centered' for study goal", () => {
    expect(
      resolveHomeLayoutVariant(
        fixtures.profile('study_focused'),
        makeStats(),
      ),
    ).toBe('study_centered');
  });
  it("returns 'game_centered' for game_like motivation", () => {
    expect(
      resolveHomeLayoutVariant(fixtures.profile('game_like'), makeStats()),
    ).toBe('game_centered');
  });
  it("returns 'full_expanded' for 10+ sessions", () => {
    expect(
      resolveHomeLayoutVariant(
        fixtures.profile('friendly'),
        makeStats({ totalCompletedSessions: 10 }),
      ),
    ).toBe('full_expanded');
  });
  it("returns 'coach_first' for 3-9 sessions", () => {
    expect(
      resolveHomeLayoutVariant(
        fixtures.profile('friendly'),
        makeStats({ totalCompletedSessions: 5 }),
      ),
    ).toBe('coach_first');
  });
  it("returns 'compact_starter' for < 3 sessions", () => {
    expect(
      resolveHomeLayoutVariant(
        fixtures.profile('friendly'),
        makeStats({ totalCompletedSessions: 1 }),
      ),
    ).toBe('compact_starter');
  });
});
