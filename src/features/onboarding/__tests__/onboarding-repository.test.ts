const mockFrom = jest.fn();

jest.mock('../../../config/supabase', () => ({
  getSupabaseClient: () => ({ from: mockFrom }),
}));

import {
  OnboardingRepositoryError,
  onboardingRepository,
} from '../repository';

const userId = '123e4567-e89b-12d3-a456-426614174000';

const dbRow = {
  id: '123e4567-e89b-12d3-a456-426614174111',
  user_id: userId,
  status: 'IN_PROGRESS',
  steps: {
    profileStarted: true,
    goalSelected: true,
    firstSessionStarted: false,
    firstSessionCompleted: false,
    rewardSeen: false,
  },
  first_session: {},
  permissions: { notificationAsked: false, notificationGranted: false },
  goal: 'STUDY',
  focus_duration: 25,
  display_name: 'TestUser',
  persona: 'mentor',
  element: 'FLAME',
  motivation_profile: { primary: 'study_focused', secondary: [] },
  chosen_lane: null,
  created_at: '2026-05-30T12:00:00.000Z',
  updated_at: '2026-05-30T12:00:00.000Z',
};

describe('onboarding repository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null when no profile exists', async () => {
    const maybeSingle = jest.fn().mockResolvedValue({ data: null, error: null });
    const eq = jest.fn().mockReturnValue({ maybeSingle });
    const select = jest.fn().mockReturnValue({ eq });
    mockFrom.mockReturnValue({ select });

    const result = await onboardingRepository.getProgress(userId);

    expect(result).toBeNull();
    expect(mockFrom).toHaveBeenCalledWith('onboarding_profiles');
  });

  it('fetches and maps a progress row to domain type', async () => {
    const maybeSingle = jest.fn().mockResolvedValue({ data: dbRow, error: null });
    const eq = jest.fn().mockReturnValue({ maybeSingle });
    const select = jest.fn().mockReturnValue({ eq });
    mockFrom.mockReturnValue({ select });

    const result = await onboardingRepository.getProgress(userId);

    expect(result).not.toBeNull();
    expect(result?.userId).toBe(userId);
    expect(result?.status).toBe('IN_PROGRESS');
    expect(result?.steps.profileStarted).toBe(true);
    expect(result?.firstSession).toEqual({});
    expect(result?.permissions).toEqual({
      notificationAsked: false,
      notificationGranted: false,
    });
  });

  it('saves progress via upsert', async () => {
    const single = jest.fn().mockResolvedValue({ data: null, error: null });
    const select = jest.fn().mockReturnValue({ single });
    const upsert = jest.fn().mockReturnValue({ select });
    mockFrom.mockReturnValue({ upsert });

    await onboardingRepository.saveProgress(userId, {
      userId,
      status: 'COMPLETED',
      steps: {
        profileStarted: true,
        goalSelected: true,
        firstSessionStarted: true,
        firstSessionCompleted: true,
        rewardSeen: true,
      },
      firstSession: {},
      permissions: { notificationAsked: true, notificationGranted: true },
    });

    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: userId,
        status: 'COMPLETED',
      }),
      { onConflict: 'user_id' },
    );
  });

  it('throws OnboardingRepositoryError on Supabase failure', async () => {
    const maybeSingle = jest
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'db down' } });
    const eq = jest.fn().mockReturnValue({ maybeSingle });
    const select = jest.fn().mockReturnValue({ eq });
    mockFrom.mockReturnValue({ select });

    await expect(
      onboardingRepository.getProgress(userId),
    ).rejects.toThrow(OnboardingRepositoryError);
  });
});
