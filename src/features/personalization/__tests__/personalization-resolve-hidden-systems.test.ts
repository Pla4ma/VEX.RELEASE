import { resolveHiddenSystems } from '../experience-resolvers';
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

describe('resolveHiddenSystems', () => {
  it('always hides base gamification systems', () => {
    const result = resolveHiddenSystems(fixtures.profile('calm'), makeStats());
    expect(result.hiddenSystems).toContain('shop');
    expect(result.hiddenSystems).toContain('inventory');
    expect(result.hiddenSystems).toContain('battle_pass');
    expect(result.hiddenSystems).toContain('wagers');
  });
  it('hides advanced_economy and premium_currency for calm style', () => {
    const result = resolveHiddenSystems(fixtures.profile('calm'), makeStats());
    expect(result.hiddenSystems).toContain('advanced_economy');
    expect(result.hiddenSystems).toContain('premium_currency');
  });
  it('hides advanced_economy and premium_currency for study_focused style', () => {
    const result = resolveHiddenSystems(fixtures.profile('study_focused'), makeStats());
    expect(result.hiddenSystems).toContain('advanced_economy');
    expect(result.hiddenSystems).toContain('premium_currency');
  });
  it('bans boss_full_cta and game_hub surfaces for calm/study_focused', () => {
    const result = resolveHiddenSystems(fixtures.profile('calm'), makeStats());
    expect(result.bannedSurfaces).toContain('boss_full_cta');
    expect(result.bannedSurfaces).toContain('game_hub');
  });
  it('adds premium_currency to hiddenSystems for minimal gamification', () => {
    const result = resolveHiddenSystems(
      fixtures.profile('friendly', { gamificationIntensity: 'minimal' }),
      makeStats(),
    );
    expect(result.hiddenSystems).toContain('premium_currency');
  });
  it('teases boss_tab when engagement is none but sessions > 5', () => {
    const result = resolveHiddenSystems(
      fixtures.profile('friendly'),
      makeStats({ bossChallengeEngagement: 'none', totalCompletedSessions: 6 }),
    );
    expect(result.teasedSystems).toContain('boss_tab');
  });
  it('does not tease boss_tab when engagement is not none', () => {
    const result = resolveHiddenSystems(
      fixtures.profile('friendly'),
      makeStats({ bossChallengeEngagement: 'low', totalCompletedSessions: 6 }),
    );
    expect(result.teasedSystems).not.toContain('boss_tab');
  });
});
