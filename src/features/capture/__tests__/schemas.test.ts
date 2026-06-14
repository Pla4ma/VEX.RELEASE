import { CaptureTypeSchema, CaptureItemSchema, CaptureFormStateSchema } from '../schemas';

describe('Capture schemas', () => {
  describe('CaptureTypeSchema', () => {
    it('accepts valid types', () => {
      expect(CaptureTypeSchema.safeParse('voice').success).toBe(true);
      expect(CaptureTypeSchema.safeParse('photo').success).toBe(true);
      expect(CaptureTypeSchema.safeParse('link').success).toBe(true);
      expect(CaptureTypeSchema.safeParse('braindump').success).toBe(true);
    });

    it('rejects invalid types', () => {
      expect(CaptureTypeSchema.safeParse('invalid').success).toBe(false);
      expect(CaptureTypeSchema.safeParse('').success).toBe(false);
      expect(CaptureTypeSchema.safeParse('Voice').success).toBe(false);
    });
  });

  describe('CaptureItemSchema', () => {
    const validItem = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      type: 'voice',
      content: 'Test capture content',
      metadata: { source: 'microphone' },
      createdAt: '2026-06-14T10:00:00.000Z',
      userId: '123e4567-e89b-12d3-a456-426614174001',
    };

    it('accepts valid item', () => {
      const result = CaptureItemSchema.safeParse(validItem);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe('voice');
        expect(result.data.content).toBe('Test capture content');
      }
    });

    it('rejects empty content', () => {
      const result = CaptureItemSchema.safeParse({ ...validItem, content: '' });
      expect(result.success).toBe(false);
    });

    it('rejects content over 10000 chars', () => {
      const result = CaptureItemSchema.safeParse({ ...validItem, content: 'a'.repeat(10001) });
      expect(result.success).toBe(false);
    });

    it('rejects invalid UUID for id', () => {
      const result = CaptureItemSchema.safeParse({ ...validItem, id: 'not-uuid' });
      expect(result.success).toBe(false);
    });

    it('rejects invalid ISO datetime', () => {
      const result = CaptureItemSchema.safeParse({ ...validItem, createdAt: 'not-a-date' });
      expect(result.success).toBe(false);
    });

    it('accepts optional metadata', () => {
      const result = CaptureItemSchema.safeParse({ ...validItem, metadata: undefined });
      expect(result.success).toBe(true);
    });
  });

  describe('CaptureFormStateSchema', () => {
    it('accepts valid form state', () => {
      const validState = {
        type: 'photo' as const,
        content: 'Test content',
        isSubmitting: false,
        error: null,
      };
      const result = CaptureFormStateSchema.safeParse(validState);
      expect(result.success).toBe(true);
    });

    it('accepts error string', () => {
      const stateWithError = {
        type: 'link' as const,
        content: '',
        isSubmitting: false,
        error: 'Content cannot be empty',
      };
      const result = CaptureFormStateSchema.safeParse(stateWithError);
      expect(result.success).toBe(true);
    });
  });
});