/**
 * Content-Study Tests: Validation Schemas
 */
import { describe, it, expect } from '@jest/globals';

import {
  YouTubeUrlSchema,
  FileUploadSchema,
  PastedTextSchema,
  TitleSchema,
} from '../validation-schemas';
import { CONTENT_STUDY_CONSTANTS } from '../types';

// ============================================================================
// YouTubeUrlSchema
// ============================================================================
describe('YouTubeUrlSchema', () => {
  it('accepts valid youtube.com/watch URL', () => {
    expect(YouTubeUrlSchema.safeParse('https://www.youtube.com/watch?v=dQw4w9WgXcQ').success).toBe(true);
  });

  it('accepts valid youtu.be URL', () => {
    expect(YouTubeUrlSchema.safeParse('https://youtu.be/dQw4w9WgXcQ').success).toBe(true);
  });

  it('accepts valid shorts URL', () => {
    expect(YouTubeUrlSchema.safeParse('https://www.youtube.com/shorts/dQw4w9WgXcQ').success).toBe(true);
  });

  it('accepts valid embed URL', () => {
    expect(YouTubeUrlSchema.safeParse('https://www.youtube.com/embed/dQw4w9WgXcQ').success).toBe(true);
  });

  it('rejects non-YouTube URL', () => {
    expect(YouTubeUrlSchema.safeParse('https://example.com').success).toBe(false);
  });

  it('rejects empty string', () => {
    expect(YouTubeUrlSchema.safeParse('').success).toBe(false);
  });
});

// ============================================================================
// FileUploadSchema
// ============================================================================
describe('FileUploadSchema', () => {
  const validFile = {
    uri: 'file:///test.pdf',
    name: 'test.pdf',
    size: 1024,
    type: 'application/pdf' as const,
  };

  it('accepts valid file object', () => {
    expect(FileUploadSchema.safeParse(validFile).success).toBe(true);
  });

  it('rejects file exceeding max size', () => {
    const result = FileUploadSchema.safeParse({
      ...validFile,
      size: CONTENT_STUDY_CONSTANTS.MAX_PDF_SIZE + 1,
    });
    expect(result.success).toBe(false);
  });

  it('rejects file with empty uri', () => {
    expect(FileUploadSchema.safeParse({ ...validFile, uri: '' }).success).toBe(false);
  });

  it('rejects unsupported file type', () => {
    expect(FileUploadSchema.safeParse({ ...validFile, type: 'image/jpeg' }).success).toBe(false);
  });
});

// ============================================================================
// PastedTextSchema
// ============================================================================
describe('PastedTextSchema', () => {
  it('accepts text within valid range', () => {
    const text = 'a'.repeat(200);
    expect(PastedTextSchema.safeParse(text).success).toBe(true);
  });

  it('rejects text shorter than MIN_PASTE_LENGTH', () => {
    expect(PastedTextSchema.safeParse('short').success).toBe(false);
  });

  it('rejects text longer than MAX_PASTE_LENGTH', () => {
    const text = 'a'.repeat(CONTENT_STUDY_CONSTANTS.MAX_PASTE_LENGTH + 1);
    expect(PastedTextSchema.safeParse(text).success).toBe(false);
  });
});

// ============================================================================
// TitleSchema
// ============================================================================
describe('TitleSchema', () => {
  it('accepts undefined (optional)', () => {
    expect(TitleSchema.safeParse(undefined).success).toBe(true);
  });

  it('accepts valid title', () => {
    expect(TitleSchema.safeParse('My Study Notes').success).toBe(true);
  });

  it('rejects title exceeding max length', () => {
    expect(TitleSchema.safeParse('a'.repeat(CONTENT_STUDY_CONSTANTS.MAX_TITLE_LENGTH + 1)).success).toBe(false);
  });
});
