import {
  validateYouTubeUrl,
  validatePastedText,
  validateFileUpload,
  validateTitle,
  validateContentSubmission,
} from '../validation';
import { CONTENT_STUDY_CONSTANTS } from '../types';

describe('Validation Functions', () => {
  describe('validateYouTubeUrl', () => {
    it('should return valid result for correct URL', () => {
      const result = validateYouTubeUrl(
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      );
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.metadata?.youtubeVideoId).toBe('dQw4w9WgXcQ');
    });
    it('should return warning for playlist URLs', () => {
      const result = validateYouTubeUrl(
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PLsomeplaylist',
      );
      expect(result.isValid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0].code).toBe('PLAYLIST_URL');
    });
    it('should return warning for timestamp URLs', () => {
      const result = validateYouTubeUrl(
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=120',
      );
      expect(result.isValid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0].code).toBe('TIMESTAMP_URL');
    });
    it('should return error for empty URL', () => {
      const result = validateYouTubeUrl('');
      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe('REQUIRED');
    });
    it('should return error for URL that is too long', () => {
      const longUrl =
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ&' + 'x=y&'.repeat(500);
      const result = validateYouTubeUrl(longUrl);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe('TOO_LONG');
    });
  });
  describe('validatePastedText', () => {
    it('should return valid result for text within limits', () => {
      const text = 'a'.repeat(500);
      const result = validatePastedText(text);
      expect(result.isValid).toBe(true);
      expect(result.metadata?.characterCount).toBe(500);
      expect(result.metadata?.wordCount).toBe(1);
    });
    it('should return warning for short content', () => {
      const text = 'a'.repeat(150);
      const result = validatePastedText(text);
      expect(result.isValid).toBe(true);
      expect(result.warnings.some((w) => w.code === 'SHORT_CONTENT')).toBe(
        true,
      );
    });
    it('should return warning for long content', () => {
      const text = 'a'.repeat(35000);
      const result = validatePastedText(text);
      expect(result.isValid).toBe(true);
      expect(result.warnings.some((w) => w.code === 'LONG_CONTENT')).toBe(true);
    });
    it('should return warning for poor formatting', () => {
      const text =
        'A\n\n\n\n\nB\n\n\n\n\nC\n\n\n\n\nD\n\n\n\n\nE\n\n\n\n\nF\n\n\n\n\nG';
      const result = validatePastedText(text);
      expect(result.warnings.some((w) => w.code === 'POOR_FORMATTING')).toBe(
        true,
      );
    });
    it('should return error for empty text', () => {
      const result = validatePastedText('');
      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe('REQUIRED');
    });
    it('should calculate estimated read time', () => {
      const text = 'word '.repeat(400);
      const result = validatePastedText(text);
      expect(result.metadata?.estimatedReadTime).toBe(2);
    });
  });
  describe('validateFileUpload', () => {
    it('should return valid result for valid file', () => {
      const file = {
        uri: 'file:///path/to/file.pdf',
        name: 'file.pdf',
        size: 1024 * 1024,
        type: 'application/pdf',
      };
      const result = validateFileUpload(file);
      expect(result.isValid).toBe(true);
    });
    it('should return error for oversized file', () => {
      const file = {
        uri: 'file:///path/to/large.pdf',
        name: 'large.pdf',
        size: CONTENT_STUDY_CONSTANTS.MAX_PDF_SIZE + 1,
        type: 'application/pdf',
      };
      const result = validateFileUpload(file);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe('FILE_TOO_LARGE');
    });
    it('should return error for unsupported type', () => {
      const file = {
        uri: 'file:///path/to/image.jpg',
        name: 'image.jpg',
        size: 1000,
        type: 'image/jpeg',
      };
      const result = validateFileUpload(file);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe('UNSUPPORTED_TYPE');
    });
    it('should return warning for large but acceptable files', () => {
      const file = {
        uri: 'file:///path/to/large.pdf',
        name: 'large.pdf',
        size: 6 * 1024 * 1024,
        type: 'application/pdf',
      };
      const result = validateFileUpload(file);
      expect(result.isValid).toBe(true);
      expect(result.warnings[0].code).toBe('LARGE_FILE');
    });
    it('should return error for null file', () => {
      const result = validateFileUpload(null);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe('REQUIRED');
    });
  });
  describe('validateTitle', () => {
    it('should return valid for acceptable titles', () => {
      const result = validateTitle('My Study Title');
      expect(result.isValid).toBe(true);
    });
    it('should return valid for empty/undefined title', () => {
      expect(validateTitle('').isValid).toBe(true);
      expect(validateTitle(undefined).isValid).toBe(true);
    });
    it('should return warning for title with special characters', () => {
      const result = validateTitle('Title with [brackets] and {braces}');
      expect(result.isValid).toBe(true);
      expect(result.warnings[0].code).toBe('SPECIAL_CHARS');
    });
    it('should return error for title that is too long', () => {
      const longTitle = 'a'.repeat(
        CONTENT_STUDY_CONSTANTS.MAX_TITLE_LENGTH + 1,
      );
      const result = validateTitle(longTitle);
      expect(result.isValid).toBe(false);
    });
  });
  describe('validateContentSubmission', () => {
    it('should validate PASTE submission', () => {
      const result = validateContentSubmission('PASTE', {
        text: 'a'.repeat(500),
        title: 'My Notes',
      });
      expect(result.isValid).toBe(true);
      expect(result.metadata?.characterCount).toBe(500);
    });
    it('should validate PDF submission', () => {
      const result = validateContentSubmission('PDF', {
        file: {
          uri: 'file:///path/to/file.pdf',
          name: 'file.pdf',
          size: 1024 * 1024,
          type: 'application/pdf',
        },
      });
      expect(result.isValid).toBe(true);
    });
    it('should validate YOUTUBE submission', () => {
      const result = validateContentSubmission('YOUTUBE', {
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      });
      expect(result.isValid).toBe(true);
      expect(result.metadata?.youtubeVideoId).toBe('dQw4w9WgXcQ');
    });
    it('should accumulate errors from multiple validations', () => {
      const result = validateContentSubmission('PASTE', {
        text: '',
        title: 'a'.repeat(CONTENT_STUDY_CONSTANTS.MAX_TITLE_LENGTH + 1),
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });
});
