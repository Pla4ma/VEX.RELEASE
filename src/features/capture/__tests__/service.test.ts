import { submitCapture, loadCaptures } from '../service';

jest.mock('../repository', () => ({
  createCapture: jest.fn(),
  fetchCaptures: jest.fn(),
}));

import { createCapture, fetchCaptures } from '../repository';

describe('capture service', () => {
  const mockUserId = '123e4567-e89b-12d3-a456-426614174000';
  const mockCapture = {
    id: '123e4567-e89b-12d3-a456-426614174001',
    type: 'voice' as const,
    content: 'Test capture',
    metadata: { source: 'mic' },
    createdAt: '2026-06-14T10:00:00.000Z',
    userId: mockUserId,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('submitCapture', () => {
    it('returns error for empty content', async () => {
      const result = await submitCapture(mockUserId, 'voice', '   ');
      expect(result.item).toBeNull();
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toBe('Capture content cannot be empty');
      expect(createCapture).not.toHaveBeenCalled();
    });

    it('returns error for whitespace-only content', async () => {
      const result = await submitCapture(mockUserId, 'photo', '\n\t  ');
      expect(result.item).toBeNull();
      expect(result.error).toBeInstanceOf(Error);
      expect(createCapture).not.toHaveBeenCalled();
    });

    it('calls createCapture with correct params on valid input', async () => {
      (createCapture as jest.Mock).mockResolvedValue({ data: mockCapture, error: null });

      const result = await submitCapture(mockUserId, 'voice', 'Test content', { source: 'mic' });

      expect(createCapture).toHaveBeenCalledWith(mockUserId, 'voice', 'Test content', { source: 'mic' });
      expect(result.item).toEqual(mockCapture);
      expect(result.error).toBeNull();
    });

    it('returns error when createCapture fails', async () => {
      const dbError = new Error('Database error');
      (createCapture as jest.Mock).mockResolvedValue({ data: null, error: dbError });

      const result = await submitCapture(mockUserId, 'braindump', 'Test');

      expect(result.item).toBeNull();
      expect(result.error).toBe(dbError);
    });
  });

  describe('loadCaptures', () => {
    it('fetches captures with default limit', async () => {
      const mockCaptures = [mockCapture];
      (fetchCaptures as jest.Mock).mockResolvedValue({ data: mockCaptures, error: null });

      const result = await loadCaptures(mockUserId);

      expect(fetchCaptures).toHaveBeenCalledWith(mockUserId, undefined);
      expect(result.items).toEqual(mockCaptures);
      expect(result.error).toBeNull();
    });

    it('fetches captures with custom limit', async () => {
      (fetchCaptures as jest.Mock).mockResolvedValue({ data: [], error: null });

      await loadCaptures(mockUserId, 10);

      expect(fetchCaptures).toHaveBeenCalledWith(mockUserId, 10);
    });

    it('returns empty array on fetch error', async () => {
      const dbError = new Error('Fetch failed');
      (fetchCaptures as jest.Mock).mockResolvedValue({ data: null, error: dbError });

      const result = await loadCaptures(mockUserId);

      expect(result.items).toEqual([]);
      expect(result.error).toBe(dbError);
    });
  });
});