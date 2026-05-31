import {
  YouTubeUrlSchema,
  FileUploadSchema,
  PastedTextSchema,
  TitleSchema,
} from '../validation';
import { CONTENT_STUDY_CONSTANTS } from '../types';

describe('Validation Schemas', () => {
  describe('YouTubeUrlSchema', () => {
    it('should validate standard youtube.com/watch URLs', () => {
      const validUrls = [
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'https://youtube.com/watch?v=dQw4w9WgXcQ',
        'http://www.youtube.com/watch?v=dQw4w9WgXcQ',
      ];
      validUrls.forEach((url) => {
        expect(YouTubeUrlSchema.safeParse(url).success).toBe(true);
      });
    });
    it('should validate youtu.be short URLs', () => {
      const validUrls = [
        'https://youtu.be/dQw4w9WgXcQ',
        'https://www.youtu.be/dQw4w9WgXcQ',
      ];
      validUrls.forEach((url) => {
        expect(YouTubeUrlSchema.safeParse(url).success).toBe(true);
      });
    });
    it('should validate YouTube Shorts URLs', () => {
      const validUrls = [
        'https://www.youtube.com/shorts/dQw4w9WgXcQ',
        'https://youtube.com/shorts/dQw4w9WgXcQ',
      ];
      validUrls.forEach((url) => {
        expect(YouTubeUrlSchema.safeParse(url).success).toBe(true);
      });
    });
    it('should validate embed URLs', () => {
      const validUrls = ['https://www.youtube.com/embed/dQw4w9WgXcQ'];
      validUrls.forEach((url) => {
        expect(YouTubeUrlSchema.safeParse(url).success).toBe(true);
      });
    });
    it('should reject invalid YouTube URLs', () => {
      const invalidUrls = [
        'https://www.youtube.com/watch',
        'https://www.youtube.com/',
        'https://example.com/watch?v=dQw4w9WgXcQ',
        'not-a-url',
        '',
      ];
      invalidUrls.forEach((url) => {
        expect(YouTubeUrlSchema.safeParse(url).success).toBe(false);
      });
    });
  });
  describe('FileUploadSchema', () => {
    it('should validate PDF files', () => {
      const validFile = {
        uri: 'file:///path/to/document.pdf',
        name: 'document.pdf',
        size: 1024 * 1024,
        type: 'application/pdf',
      };
      expect(FileUploadSchema.safeParse(validFile).success).toBe(true);
    });
    it('should validate text files', () => {
      const validFiles = [
        {
          uri: 'file:///path/to/file.txt',
          name: 'file.txt',
          size: 1000,
          type: 'text/plain',
        },
        {
          uri: 'file:///path/to/file.md',
          name: 'file.md',
          size: 1000,
          type: 'text/markdown',
        },
      ];
      validFiles.forEach((file) => {
        expect(FileUploadSchema.safeParse(file).success).toBe(true);
      });
    });
    it('should reject files that are too large', () => {
      const oversizedFile = {
        uri: 'file:///path/to/large.pdf',
        name: 'large.pdf',
        size: CONTENT_STUDY_CONSTANTS.MAX_PDF_SIZE + 1,
        type: 'application/pdf',
      };
      expect(FileUploadSchema.safeParse(oversizedFile).success).toBe(false);
    });
    it('should reject unsupported file types', () => {
      const invalidFile = {
        uri: 'file:///path/to/image.jpg',
        name: 'image.jpg',
        size: 1000,
        type: 'image/jpeg',
      };
      expect(FileUploadSchema.safeParse(invalidFile).success).toBe(false);
    });
    it('should reject files with missing required fields', () => {
      const incompleteFiles = [
        { uri: '', name: 'file.pdf', size: 1000, type: 'application/pdf' },
        {
          uri: 'file:///path/to/file.pdf',
          name: '',
          size: 1000,
          type: 'application/pdf',
        },
      ];
      incompleteFiles.forEach((file) => {
        expect(FileUploadSchema.safeParse(file).success).toBe(false);
      });
    });
  });
  describe('PastedTextSchema', () => {
    it('should validate text within length limits', () => {
      const validText = 'a'.repeat(
        CONTENT_STUDY_CONSTANTS.MIN_PASTE_LENGTH + 100,
      );
      expect(PastedTextSchema.safeParse(validText).success).toBe(true);
    });
    it('should reject text that is too short', () => {
      const shortText = 'a'.repeat(
        CONTENT_STUDY_CONSTANTS.MIN_PASTE_LENGTH - 1,
      );
      expect(PastedTextSchema.safeParse(shortText).success).toBe(false);
    });
    it('should reject text that exceeds max length', () => {
      const longText = 'a'.repeat(CONTENT_STUDY_CONSTANTS.MAX_PASTE_LENGTH + 1);
      expect(PastedTextSchema.safeParse(longText).success).toBe(false);
    });
    it('should reject empty text', () => {
      expect(PastedTextSchema.safeParse('').success).toBe(false);
      expect(PastedTextSchema.safeParse('   ').success).toBe(false);
    });
  });
  describe('TitleSchema', () => {
    it('should validate titles within length limit', () => {
      const validTitle = 'a'.repeat(CONTENT_STUDY_CONSTANTS.MAX_TITLE_LENGTH);
      expect(TitleSchema.safeParse(validTitle).success).toBe(true);
    });
    it('should allow empty/undefined title', () => {
      expect(TitleSchema.safeParse('').success).toBe(true);
      expect(TitleSchema.safeParse(undefined).success).toBe(true);
    });
    it('should reject titles that are too long', () => {
      const longTitle = 'a'.repeat(
        CONTENT_STUDY_CONSTANTS.MAX_TITLE_LENGTH + 1,
      );
      expect(TitleSchema.safeParse(longTitle).success).toBe(false);
    });
  });
});
