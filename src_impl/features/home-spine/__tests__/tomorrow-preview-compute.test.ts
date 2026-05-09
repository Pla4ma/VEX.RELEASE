import { computeTomorrowPreview } from '../tomorrowPreviewService';

const mockStorage: Record<string, string> = {};

jest.mock('@sentry/react-native', () => ({
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
}));

jest.mock(
  '../../../store/mmkv-storage',
  () => ({
    storage: {
      delete: (key: string) => {
        delete mockStorage[key];
      },
      getString: (key: string) => mockStorage[key] ?? null,
      set: (key: string, value: string) => {
        mockStorage[key] = value;
      },
    },
  }),
  { virtual: true }
);

describe('computeTomorrowPreview', () => {
  const mockUserId = '550e8400-e29b-41d4-a716-446655440000';

  beforeEach(() => {
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
    jest.clearAllMocks();
  });

  it('returns STREAK_MILESTONE when streak reaches milestone tomorrow', () => {
    const preview = computeTomorrowPreview({
      currentStreakDays: 6,
      streakWillContinue: true,
      userId: mockUserId,
    });

    expect(preview.type).toBe('STREAK_MILESTONE');
    expect(preview.priority).toBeLessThanOrEqual(2);
    expect(preview.headline).toContain('7');
    expect(preview.emoji).toBe('🔥');
  });

  it('returns BOSS_NEAR_DEATH when boss health is low', () => {
    const preview = computeTomorrowPreview({
      bossData: {
        bossName: 'Procrastination Dragon',
        canDefeatTomorrow: true,
        healthPercent: 20,
      },
      currentStreakDays: 3,
      streakWillContinue: true,
      userId: mockUserId,
    });

    expect(preview.type).toBe('BOSS_NEAR_DEATH');
    expect(preview.priority).toBeLessThanOrEqual(2);
    expect(preview.headline).toContain('Dragon');
  });

  it('chooses one top preview when multiple high-priority candidates exist', () => {
    const preview = computeTomorrowPreview({
      bossData: {
        bossName: 'Distraction Demon',
        canDefeatTomorrow: true,
        healthPercent: 15,
      },
      currentStreakDays: 6,
      streakWillContinue: true,
      userId: mockUserId,
    });

    expect(['BOSS_NEAR_DEATH', 'STREAK_MILESTONE']).toContain(preview.type);
  });

  it('returns CHALLENGE_RESET when challenge XP is available', () => {
    const preview = computeTomorrowPreview({
      challengeData: {
        incompleteChallenges: 3,
        xpAvailable: 500,
      },
      currentStreakDays: 2,
      streakWillContinue: true,
      userId: mockUserId,
    });

    expect(preview.type).toBe('CHALLENGE_RESET');
    expect(preview.headline).toContain('Challenges');
  });

  it('returns generic previews for non-notable tomorrow states', () => {
    expect(
      computeTomorrowPreview({
        currentStreakDays: 5,
        streakWillContinue: false,
        userId: mockUserId,
      }).type
    ).toBe('GENERIC');

    const streakPreview = computeTomorrowPreview({
      currentStreakDays: 2,
      streakWillContinue: true,
      userId: mockUserId,
    });

    expect(streakPreview.type).toBe('GENERIC');
    expect(streakPreview.headline).toContain('Streak');
  });
});
