/**
 * Tests for focus-memory expiry.ts
 */
import { mockStore, currentTime } from './helpers';
import { expiryForType, isSensitiveMemory } from '../expiry';

describe('focus-memory expiry tests', () => {
  beforeEach(() => {
    mockStore.clear();
    jest.spyOn(Date, 'now').mockReturnValue(currentTime);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('expiryForType', () => {
    it('returns null for persistent types (preferred_tone, project_continuity, friction_preference)', () => {
      expect(expiryForType('preferred_tone', currentTime)).toBeNull();
      expect(expiryForType('project_continuity', currentTime)).toBeNull();
      expect(expiryForType('friction_preference', currentTime)).toBeNull();
    });

    it('returns 45-day expiry for successful_session_pattern', () => {
      const result = expiryForType('successful_session_pattern', currentTime);
      expect(result).toBe(currentTime + 45 * 24 * 60 * 60 * 1000);
    });

    it('returns 60-day expiry for lane_evidence', () => {
      const result = expiryForType('lane_evidence', currentTime);
      expect(result).toBe(currentTime + 60 * 24 * 60 * 60 * 1000);
    });

    it('returns 7-day expiry for study_deadline', () => {
      const result = expiryForType('study_deadline', currentTime);
      expect(result).toBe(currentTime + 7 * 24 * 60 * 60 * 1000);
    });

    it('returns 30-day expiry for default types', () => {
      const types30 = [
        'best_time_window',
        'avoidance_trigger',
        'failed_session_pattern',
        'notification_preference',
      ] as const;
      for (const type of types30) {
        const result = expiryForType(type, currentTime);
        expect(result).toBe(currentTime + 30 * 24 * 60 * 60 * 1000);
      }
    });
  });

  describe('isSensitiveMemory', () => {
    it('returns true for study_deadline and project_continuity', () => {
      expect(isSensitiveMemory('study_deadline')).toBe(true);
      expect(isSensitiveMemory('project_continuity')).toBe(true);
    });

    it('returns false for non-sensitive types', () => {
      expect(isSensitiveMemory('best_time_window')).toBe(false);
      expect(isSensitiveMemory('preferred_tone')).toBe(false);
      expect(isSensitiveMemory('avoidance_trigger')).toBe(false);
      expect(isSensitiveMemory('lane_evidence')).toBe(false);
    });
  });
});
