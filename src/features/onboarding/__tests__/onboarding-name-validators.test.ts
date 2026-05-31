/**
 * Comprehensive Onboarding Feature Tests — Name Validators
 */

import './onboarding-mock-setup';

import { NameValidators } from '../utils/name-validators';

// ── Name Validators ───────────────────────────────────────────────────────────

describe('NameValidators', () => {
  describe('validate', () => {
    it('accepts valid name', () => {
      const result = NameValidators.validate('Alice');
      expect(result.success).toBe(true);
      expect(result.data).toBe('Alice');
    });

    it('trims whitespace', () => {
      const result = NameValidators.validate('  Alice  ');
      expect(result.success).toBe(true);
      expect(result.data).toBe('Alice');
    });

    it('rejects non-string', () => {
      const result = NameValidators.validate(123);
      expect(result.success).toBe(false);
      expect(result.errors[0]!.code).toBe('INVALID_NAME_TYPE');
    });

    it('rejects empty string', () => {
      const result = NameValidators.validate('');
      expect(result.success).toBe(false);
      expect(result.errors[0]!.code).toBe('NAME_REQUIRED');
    });

    it('rejects whitespace-only string', () => {
      const result = NameValidators.validate('   ');
      expect(result.success).toBe(false);
      expect(result.errors[0]!.code).toBe('NAME_REQUIRED');
    });

    it('rejects name shorter than 2 characters', () => {
      const result = NameValidators.validate('A');
      expect(result.success).toBe(false);
      expect(result.errors[0]!.code).toBe('NAME_TOO_SHORT');
    });

    it('rejects name longer than 30 characters', () => {
      const result = NameValidators.validate('A'.repeat(31));
      expect(result.success).toBe(false);
      expect(result.errors[0]!.code).toBe('NAME_TOO_LONG');
    });

    it('rejects name with invalid characters', () => {
      const result = NameValidators.validate('Alice@#');
      expect(result.success).toBe(false);
      expect(result.errors[0]!.code).toBe('NAME_INVALID_CHARACTERS');
    });

    it('warns on very short names', () => {
      const result = NameValidators.validate('Ab');
      expect(result.success).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]!.code).toBe('NAME_VERY_SHORT');
    });

    it('warns on test-like names', () => {
      const result = NameValidators.validate('testuser');
      expect(result.success).toBe(true);
      const testWarning = result.warnings.find(
        (w) => w.code === 'NAME_LIKE_TEST_DATA',
      );
      expect(testWarning).toBeDefined();
    });

    it('accepts names with hyphens and underscores', () => {
      const result = NameValidators.validate('Alice_Bob-123');
      expect(result.success).toBe(true);
    });
  });

  describe('generateSuggestions', () => {
    it('generates suggestions for short names', () => {
      const suggestions = NameValidators.generateSuggestions('Al');
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some((s) => s.includes('Pro'))).toBe(true);
    });

    it('capitalizes lowercase names', () => {
      const suggestions = NameValidators.generateSuggestions('alice');
      expect(suggestions.some((s) => s.startsWith('A'))).toBe(true);
    });

    it('returns max 3 suggestions', () => {
      const suggestions = NameValidators.generateSuggestions('a');
      expect(suggestions.length).toBeLessThanOrEqual(3);
    });
  });
});
