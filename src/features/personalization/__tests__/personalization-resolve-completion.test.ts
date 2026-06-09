import { resolveCompletion } from '../experience-resolvers';
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

describe('resolveCompletion', () => {
  it('includes study_progress when study available', () => {
    const result = resolveCompletion({
      availability: { ...fixtures.available, study: true },
      boss: { isVisible: false, intensity: 'subtle' } as unknown,
      stats: makeStats(),
    });
    expect(result.sequence).toContain('study_progress');
  });
  it('includes boss_effect when boss is visible', () => {
    const result = resolveCompletion({
      availability: fixtures.available,
      boss: { isVisible: true, intensity: 'standard' } as unknown,
      stats: makeStats(),
    });
    expect(result.sequence).toContain('boss_effect');
  });
  it('always includes core_saved and next_action', () => {
    const result = resolveCompletion({
      availability: { ...fixtures.available, study: false },
      boss: { isVisible: false, intensity: 'subtle' } as unknown,
      stats: makeStats(),
    });
    expect(result.sequence).toContain('core_saved');
    expect(result.sequence).toContain('next_action');
  });
});
