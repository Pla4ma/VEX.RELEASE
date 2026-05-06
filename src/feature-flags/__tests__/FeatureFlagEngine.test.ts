import FeatureFlagEngine from '../FeatureFlagEngine';

jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    getString: jest.fn(() => null),
    set: jest.fn(),
  })),
}));

jest.mock('@/utils/debug', () => ({
  createDebugger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
  }),
}));

describe('FeatureFlagEngine', () => {
  it('keeps zero-rollout risk flags disabled when user context exists', () => {
    const engine = new FeatureFlagEngine();

    engine.setUserContext({
      userId: 'user-phase-03',
      isPremium: true,
      platform: 'ios',
    });

    expect(engine.isEnabled('emergency_gem_sinks')).toBe(false);
    expect(engine.isEnabled('boss_bounty_system')).toBe(false);
    expect(engine.isEnabled('squad_boss_system')).toBe(false);
    expect(engine.isEnabled('weekly_boss_raids')).toBe(false);
  });

  it('keeps explicitly enabled full-rollout flags enabled', () => {
    const engine = new FeatureFlagEngine();

    engine.setUserContext({
      userId: 'user-phase-03',
      platform: 'ios',
    });

    expect(engine.isEnabled('focus_score_primary')).toBe(true);
  });
});
