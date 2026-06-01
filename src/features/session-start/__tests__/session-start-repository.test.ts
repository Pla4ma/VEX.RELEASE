/**
 * Tests for session-start repository.
 */

import * as repository from '../repository';

// Mock Supabase client
const mockSingle = jest.fn();
const mockSelect = jest.fn(() => ({ eq: mockEq, single: mockSingle }));
const mockEq = jest.fn(() => ({ single: mockSingle }));
const mockUpsert = jest.fn();
const mockFrom = jest.fn(() => ({
  select: mockSelect,
  upsert: mockUpsert,
  eq: mockEq,
}));

jest.mock('../../../config/supabase', () => ({
  getSupabaseClient: jest.fn(() => ({
    from: mockFrom,
  })),
}));

jest.mock('@sentry/react-native', () => ({
  captureException: jest.fn(),
}));

jest.mock('../../../shared/analytics/analytics-service', () => ({
  capture: jest.fn(),
}));

describe('session-start: repository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDifficultyPreference', () => {
    it('returns mapped preference on success', async () => {
      mockSingle.mockResolvedValueOnce({
        data: {
          user_id: 'u1',
          current_difficulty: 'FOCUSED',
          suggested_difficulty: null,
          last_suggestion_at: null,
          suggestion_dismissed_at: null,
          times_shown: 0,
          times_accepted: 0,
        },
        error: null,
      });

      const result = await repository.getDifficultyPreference('u1');
      expect(result).not.toBeNull();
      expect(result?.userId).toBe('u1');
      expect(result?.currentDifficulty).toBe('FOCUSED');
    });

    it('returns null when no row found (PGRST116)', async () => {
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116', message: 'not found' },
      });

      const result = await repository.getDifficultyPreference('u1');
      expect(result).toBeNull();
    });

    it('returns null and captures exception on other errors', async () => {
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST500', message: 'server error' },
      });

      const result = await repository.getDifficultyPreference('u1');
      expect(result).toBeNull();
    });
  });

  describe('saveDifficultyPreference', () => {
    it('calls upsert with the correct mapped fields', async () => {
      mockUpsert.mockResolvedValueOnce({ error: null });

      await repository.saveDifficultyPreference({
        userId: 'u1',
        currentDifficulty: 'FOCUSED',
        suggestedDifficulty: null,
        timesShown: 5,
        timesAccepted: 2,
      });

      expect(mockUpsert).toHaveBeenCalledTimes(1);
      const call = mockUpsert.mock.calls[0][0];
      expect(call.user_id).toBe('u1');
      expect(call.current_difficulty).toBe('FOCUSED');
      expect(call.times_shown).toBe(5);
    });

    it('throws when upsert returns an error', async () => {
      mockUpsert.mockResolvedValueOnce({
        error: { message: 'duplicate' },
      });

      await expect(
        repository.saveDifficultyPreference({
          userId: 'u1',
          currentDifficulty: 'CASUAL',
          suggestedDifficulty: null,
          timesShown: 0,
          timesAccepted: 0,
        }),
      ).rejects.toThrow();
    });
  });

  describe('updateCurrentDifficulty', () => {
    it('upserts the current difficulty', async () => {
      mockUpsert.mockResolvedValueOnce({ error: null });

      await repository.updateCurrentDifficulty('u1', 'INTENSE');
      expect(mockUpsert).toHaveBeenCalledTimes(1);
      expect(mockUpsert.mock.calls[0][0].current_difficulty).toBe('INTENSE');
    });

    it('throws on error', async () => {
      mockUpsert.mockResolvedValueOnce({
        error: { message: 'fail' },
      });

      await expect(
        repository.updateCurrentDifficulty('u1', 'CASUAL'),
      ).rejects.toThrow();
    });
  });
});
