import {
  extractYouTubeVideoId,
  isValidFileType,
  formatValidationErrors,
} from '../validation';

describe('Utility Functions', () => {
  describe('extractYouTubeVideoId', () => {
    it('should extract ID from standard URLs', () => {
      expect(
        extractYouTubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
      ).toBe('dQw4w9WgXcQ');
    });
    it('should extract ID from short URLs', () => {
      expect(extractYouTubeVideoId('https://youtu.be/dQw4w9WgXcQ')).toBe(
        'dQw4w9WgXcQ',
      );
    });
    it('should extract ID from shorts URLs', () => {
      expect(
        extractYouTubeVideoId('https://www.youtube.com/shorts/dQw4w9WgXcQ'),
      ).toBe('dQw4w9WgXcQ');
    });
    it('should return null for invalid URLs', () => {
      expect(extractYouTubeVideoId('not-a-url')).toBeNull();
      expect(extractYouTubeVideoId('')).toBeNull();
    });
  });
  describe('isValidFileType', () => {
    it('should return true for valid MIME types', () => {
      expect(isValidFileType('application/pdf')).toBe(true);
      expect(isValidFileType('text/plain')).toBe(true);
      expect(isValidFileType('text/markdown')).toBe(true);
    });
    it('should return false for invalid MIME types', () => {
      expect(isValidFileType('image/jpeg')).toBe(false);
      expect(isValidFileType('application/json')).toBe(false);
    });
  });
  describe('formatValidationErrors', () => {
    it('should format errors with newlines', () => {
      const errors = [
        {
          field: 'url',
          code: 'INVALID',
          message: 'Invalid URL',
          severity: 'error' as const,
        },
        {
          field: 'title',
          code: 'TOO_LONG',
          message: 'Title too long',
          severity: 'error' as const,
        },
        {
          field: 'file',
          code: 'LARGE',
          message: 'File is large',
          severity: 'warning' as const,
        },
      ];
      const formatted = formatValidationErrors(errors);
      expect(formatted).toContain('Invalid URL');
      expect(formatted).toContain('Title too long');
      expect(formatted).toContain('Warning: File is large');
    });
    it('should handle empty errors array', () => {
      expect(formatValidationErrors([])).toBe('');
    });
  });
});
