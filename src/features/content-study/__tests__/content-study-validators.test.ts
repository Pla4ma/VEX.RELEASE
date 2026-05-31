/**
 * Content-Study Tests: Validators
 */
import { describe, it, expect } from '@jest/globals';

import { validateYouTubeUrl, validatePastedText } from '../validators';
import { CONTENT_STUDY_CONSTANTS } from '../types';

// ============================================================================
// validateYouTubeUrl
// ============================================================================
describe('validateYouTubeUrl', () => {
  it('returns errors for empty URL', () => {
    const result = validateYouTubeUrl('');
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]!.code).toBe('REQUIRED');
  });

  it('returns valid result for correct URL', () => {
    const result = validateYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.metadata?.youtubeVideoId).toBe('dQw4w9WgXcQ');
  });

  it('warns about playlist URLs', () => {
    const result = validateYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf');
    expect(result.warnings.some((w) => w.code === 'PLAYLIST_URL')).toBe(true);
  });

  it('warns about timestamp URLs', () => {
    const result = validateYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=120');
    expect(result.warnings.some((w) => w.code === 'TIMESTAMP_URL')).toBe(true);
  });

  it('returns error for invalid format', () => {
    const result = validateYouTubeUrl('https://example.com');
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.code === 'INVALID_FORMAT')).toBe(true);
  });

  it('returns error for too-long URL', () => {
    const longUrl = 'https://www.youtube.com/watch?v=' + 'a'.repeat(CONTENT_STUDY_CONSTANTS.MAX_YOUTUBE_URL_LENGTH);
    const result = validateYouTubeUrl(longUrl);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.code === 'TOO_LONG')).toBe(true);
  });
});

// ============================================================================
// validatePastedText
// ============================================================================
describe('validatePastedText', () => {
  it('returns error for empty text', () => {
    const result = validatePastedText('');
    expect(result.isValid).toBe(false);
    expect(result.errors[0]!.code).toBe('REQUIRED');
  });

  it('returns error for whitespace-only text', () => {
    const result = validatePastedText('   ');
    expect(result.isValid).toBe(false);
  });

  it('returns error for too-short text', () => {
    const result = validatePastedText('short text');
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.code === 'TOO_SHORT')).toBe(true);
  });

  it('returns valid for sufficient text', () => {
    const text = 'a'.repeat(200);
    const result = validatePastedText(text);
    expect(result.isValid).toBe(true);
    expect(result.metadata?.characterCount).toBe(200);
    expect(result.metadata?.wordCount).toBe(1);
  });

  it('warns about short content (<200 chars)', () => {
    const text = 'a'.repeat(CONTENT_STUDY_CONSTANTS.MIN_PASTE_LENGTH);
    const result = validatePastedText(text);
    expect(result.warnings.some((w) => w.code === 'SHORT_CONTENT')).toBe(true);
  });

  it('warns about very long content (>30000 chars)', () => {
    const text = 'a'.repeat(31000);
    const result = validatePastedText(text);
    expect(result.warnings.some((w) => w.code === 'LONG_CONTENT')).toBe(true);
  });

  it('warns about excessive line breaks', () => {
    // Need separate groups of 5+ newlines (not one big block) to get >5 matches
    const groups = Array(6).fill('text\n\n\n\n\n').join('more ');
    const text = 'word '.repeat(50) + groups + 'word '.repeat(50);
    const result = validatePastedText(text);
    expect(result.warnings.some((w) => w.code === 'POOR_FORMATTING')).toBe(true);
  });

  it('computes estimatedReadTime', () => {
    const text = ('word ').repeat(400); // ~400 words
    const result = validatePastedText(text);
    expect(result.metadata?.estimatedReadTime).toBe(2); // 400/200 = 2
  });
});
