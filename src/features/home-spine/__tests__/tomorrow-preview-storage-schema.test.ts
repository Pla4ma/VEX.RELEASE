import {
  clearTomorrowPreview,
  loadTomorrowPreview,
  saveTomorrowPreview,
  TomorrowPreviewDataSchema,
  TomorrowPreviewTypeSchema,
  type TomorrowPreviewData,
} from '../tomorrowPreviewService';

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
  { virtual: true },
);

describe('tomorrow preview storage', () => {
  const mockUserId = '550e8400-e29b-41d4-a716-446655440000';

  beforeEach(() => {
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
    jest.clearAllMocks();
  });

  it('saves, loads, and clears a preview from MMKV', () => {
    const preview: TomorrowPreviewData = {
      actionPrompt: 'Start a session',
      emoji: '🔥',
      headline: '7-day streak milestone tomorrow!',
      metadata: { milestoneDay: 7 },
      priority: 2,
      subtext: 'One more session to reach your weekly streak.',
      type: 'STREAK_MILESTONE',
    };

    saveTomorrowPreview(mockUserId, preview);
    expect(loadTomorrowPreview(mockUserId)?.headline).toBe(preview.headline);

    clearTomorrowPreview(mockUserId);
    expect(loadTomorrowPreview(mockUserId)).toBeNull();
  });

  it('returns null when no preview is saved', () => {
    expect(loadTomorrowPreview(mockUserId)).toBeNull();
  });

  it('loads old previews for caller-level freshness handling', () => {
    const oldPreview: TomorrowPreviewData = {
      emoji: '🔥',
      headline: 'Old preview',
      metadata: { savedAt: Date.now() - 25 * 60 * 60 * 1000 },
      priority: 2,
      subtext: 'This should expire',
      type: 'STREAK_MILESTONE',
    };

    saveTomorrowPreview(mockUserId, oldPreview);
    const loaded = loadTomorrowPreview(mockUserId);

    expect(loaded?.metadata?.savedAt).toBeTruthy();
  });
});

describe('tomorrow preview schemas', () => {
  it('validates correct preview data', () => {
    expect(
      TomorrowPreviewDataSchema.safeParse({
        emoji: '🔥',
        headline: 'Valid headline',
        priority: 2,
        subtext: 'Valid subtext that describes the preview.',
        type: 'STREAK_MILESTONE',
      }).success,
    ).toBe(true);
  });

  it('rejects invalid priorities and empty headlines', () => {
    expect(
      TomorrowPreviewDataSchema.safeParse({
        emoji: '🔥',
        headline: 'Valid headline',
        priority: 10,
        subtext: 'Valid subtext.',
        type: 'STREAK_MILESTONE',
      }).success,
    ).toBe(false);

    expect(
      TomorrowPreviewDataSchema.safeParse({
        emoji: '🔥',
        headline: '',
        priority: 2,
        subtext: 'Valid subtext.',
        type: 'STREAK_MILESTONE',
      }).success,
    ).toBe(false);
  });

  it('accepts all valid preview types', () => {
    const validTypes = [
      'STREAK_MILESTONE',
      'BOSS_NEAR_DEATH',
      'RIVAL_GAP',
      'POWER_HOUR',
      'CHALLENGE_RESET',
      'GENERIC',
    ];

    expect(
      validTypes.every(
        (type) => TomorrowPreviewTypeSchema.safeParse(type).success,
      ),
    ).toBe(true);
  });
});
