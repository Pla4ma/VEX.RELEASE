/**
 * Tests for: scheduler-types
 */

import {
  ANALYSIS_WINDOW_DAYS,
  DEFAULT_PEAK_HOUR,
  MAX_NOTIFICATIONS_PER_DAY,
  PeakFocusWindowSchema,
  NotificationContentTypeSchema,
  SmartNotificationConfigSchema,
} from '../SmartNotificationScheduler-types';

describe('SmartNotificationScheduler Types', () => {
  it('exports correct constants', () => {
    expect(ANALYSIS_WINDOW_DAYS).toBe(14);
    expect(DEFAULT_PEAK_HOUR).toBe(19);
    expect(MAX_NOTIFICATIONS_PER_DAY).toBe(1);
  });

  describe('PeakFocusWindowSchema', () => {
    it('accepts valid window', () => {
      const result = PeakFocusWindowSchema.parse({
        userId: 'user-1',
        peakHour: 14,
        confidence: 0.8,
        sessionCount: 10,
        pattern: 'CONSISTENT',
        hourDistribution: {},
      });
      expect(result.peakHour).toBe(14);
      expect(result.pattern).toBe('CONSISTENT');
    });

    it('rejects hour outside 0-23', () => {
      expect(() =>
        PeakFocusWindowSchema.parse({
          userId: 'user-1', peakHour: 24, confidence: 0.5,
          sessionCount: 5, pattern: 'NEW', hourDistribution: {},
        }),
      ).toThrow();
    });

    it('rejects confidence > 1', () => {
      expect(() =>
        PeakFocusWindowSchema.parse({
          userId: 'user-1', peakHour: 10, confidence: 1.5,
          sessionCount: 5, pattern: 'NEW', hourDistribution: {},
        }),
      ).toThrow();
    });

    it('rejects invalid pattern', () => {
      expect(() =>
        PeakFocusWindowSchema.parse({
          userId: 'user-1', peakHour: 10, confidence: 0.5,
          sessionCount: 5, pattern: 'WRONG', hourDistribution: {},
        }),
      ).toThrow();
    });
  });

  describe('NotificationContentTypeSchema', () => {
    it('accepts all valid content types', () => {
      const types = ['STREAK', 'BOSS', 'SOCIAL', 'POSITIVE', 'COMEBACK', 'RANK_REPORT'];
      for (const type of types) {
        expect(NotificationContentTypeSchema.parse(type)).toBe(type);
      }
    });
  });

  describe('SmartNotificationConfigSchema', () => {
    it('accepts valid config with defaults', () => {
      const result = SmartNotificationConfigSchema.parse({
        userId: 'user-1',
        peakWindow: {
          userId: 'user-1',
          peakHour: 10,
          confidence: 0.5,
          sessionCount: 5,
          pattern: 'NEW',
          hourDistribution: {},
        },
      });
      expect(result.notificationCountToday).toBe(0);
      expect(result.preferredContentTypes).toEqual(['STREAK', 'BOSS', 'SOCIAL', 'POSITIVE']);
    });

    it('allows overriding defaults', () => {
      const result = SmartNotificationConfigSchema.parse({
        userId: 'user-1',
        peakWindow: {
          userId: 'user-1', peakHour: 10, confidence: 0.5,
          sessionCount: 5, pattern: 'NEW', hourDistribution: {},
        },
        notificationCountToday: 2,
        preferredContentTypes: ['COMEBACK'],
      });
      expect(result.notificationCountToday).toBe(2);
      expect(result.preferredContentTypes).toEqual(['COMEBACK']);
    });
  });
});
