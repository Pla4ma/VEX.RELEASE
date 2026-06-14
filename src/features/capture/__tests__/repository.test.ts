import { createCapture, fetchCaptures } from '../repository';

jest.mock('../../config/supabase', () => ({
  getSupabaseClient: jest.fn(() => ({
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(),
          })),
        })),
      })),
    })),
  })),
}));

import { getSupabaseClient } from '@/config/supabase';

describe('capture repository', () => {
  const mockUserId = '123e4567-e89b-12d3-a456-426614174000';
  const mockCapture = {
    id: '123e4567-e89b-12d3-a456-426614174001',
    type: 'voice',
    content: 'Test capture',
    metadata: { source: 'mic' },
    createdAt: '2026-06-14T10:00:00.000Z',
    userId: mockUserId,
  };

  let mockFrom: jest.Mock;
  let mockInsert: jest.Mock;
  let mockSelect: jest.Mock;
  let mockSingle: jest.Mock;
  let mockEq: jest.Mock;
  let mockOrder: jest.Mock;
  let mockLimit: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockFrom = jest.fn().mockReturnValue({
      insert: mockInsert = jest.fn().mockReturnValue({
        select: mockSelect = jest.fn().mockReturnValue({
          single: mockSingle = jest.fn(),
        }),
      }),
      select: mockSelect = jest.fn().mockReturnValue({
        eq: mockEq = jest.fn().mockReturnValue({
          order: mockOrder = jest.fn().mockReturnValue({
            limit: mockLimit = jest.fn(),
          }),
        }),
      }),
    });

    (getSupabaseClient as jest.Mock).mockReturnValue({ from: mockFrom });
  });

  describe('createCapture', () => {
    it('inserts capture with correct fields', async () => {
      mockSingle.mockResolvedValue({ data: mockCapture, error: null });

      const result = await createCapture(mockUserId, 'voice', 'Test content', { source: 'mic' });

      expect(mockFrom).toHaveBeenCalledWith('captures');
      expect(mockInsert).toHaveBeenCalledWith({
        user_id: mockUserId,
        type: 'voice',
        content: 'Test content',
        metadata: { source: 'mic' },
      });
      expect(result.data).toEqual(mockCapture);
      expect(result.error).toBeNull();
    });

    it('handles optional metadata', async () => {
      mockSingle.mockResolvedValue({ data: { ...mockCapture, metadata: undefined }, error: null });

      const result = await createCapture(mockUserId, 'photo', 'Test', undefined);

      expect(mockInsert).toHaveBeenCalledWith({
        user_id: mockUserId,
        type: 'photo',
        content: 'Test',
        metadata: undefined,
      });
      expect(result.error).toBeNull();
    });

    it('returns error on supabase error', async () => {
      const supabaseError = { message: 'Unique constraint violation', code: '23505' };
      mockSingle.mockResolvedValue({ data: null, error: supabaseError });

      const result = await createCapture(mockUserId, 'link', 'Test');

      expect(result.data).toBeNull();
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toBe('Unique constraint violation');
    });
  });

  describe('fetchCaptures', () => {
    it('fetches captures ordered by created_at desc with default limit', async () => {
      const mockCaptures = [mockCapture];
      mockLimit.mockResolvedValue({ data: mockCaptures, error: null });

      const result = await fetchCaptures(mockUserId);

      expect(mockFrom).toHaveBeenCalledWith('captures');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('user_id', mockUserId);
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(mockLimit).toHaveBeenCalledWith(50);
      expect(result.data).toEqual(mockCaptures);
      expect(result.error).toBeNull();
    });

    it('uses custom limit when provided', async () => {
      mockLimit.mockResolvedValue({ data: [], error: null });

      await fetchCaptures(mockUserId, 10);

      expect(mockLimit).toHaveBeenCalledWith(10);
    });

    it('returns empty array on error', async () => {
      const supabaseError = { message: 'Connection lost' };
      mockLimit.mockResolvedValue({ data: null, error: supabaseError });

      const result = await fetchCaptures(mockUserId);

      expect(result.data).toEqual([]);
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toBe('Connection lost');
    });
  });
});