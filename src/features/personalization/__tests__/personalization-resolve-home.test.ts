import { resolveHome } from '../experience-service-helpers';
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

describe('resolveHome', () => {
  it('always includes coach_line and primary_session', () => {
    const result = resolveHome({
      boss: { isVisible: false, intensity: 'subtle' } as any,
      profile: fixtures.profile('calm'),
      stats: makeStats(),
    });
    expect(result.sections).toContain('coach_line');
    expect(result.sections).toContain('primary_session');
  });
  it('includes study_layer when primaryGoal is study', () => {
    const result = resolveHome({
      boss: { isVisible: false, intensity: 'subtle' } as any,
      profile: fixtures.profile('study_focused'),
      stats: makeStats(),
    });
    expect(result.sections).toContain('study_layer');
  });
  it('includes premium_tease for 5+ sessions', () => {
    const result = resolveHome({
      boss: { isVisible: false, intensity: 'subtle' } as any,
      profile: fixtures.profile('calm'),
      stats: makeStats({ totalCompletedSessions: 5 }),
    });
    expect(result.sections).toContain('premium_tease');
  });
  it('uses direct tone coach copy for preferredTone=direct', () => {
    const result = resolveHome({
      boss: { isVisible: false, intensity: 'subtle' } as any,
      profile: fixtures.profile('intense'),
      stats: makeStats(),
    });
    expect(result.coachCopy).toContain('Start the block');
  });
});
