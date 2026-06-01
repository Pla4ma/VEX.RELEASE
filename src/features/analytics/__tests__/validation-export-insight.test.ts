import { describe, it, expect } from '@jest/globals';
import {
  validateExportConfig,
  validateInsight,
} from '../validation';

describe('Analytics Validation - Export & Insights', () => {
  describe('validateExportConfig', () => {
    it('should validate correct config', () => {
      const result = validateExportConfig({
        format: 'json',
        dateRange: {
          start: Date.now() - 7 * 24 * 60 * 60 * 1000,
          end: Date.now(),
        },
        userId: 'user-123',
      });
      expect(result.valid).toBe(true);
      const sanitized = result.sanitized as
        | { estimatedSize: number }
        | undefined;
      expect(sanitized?.estimatedSize).toBeGreaterThan(0);
    });
    it('should reject invalid format', () => {
      const result = validateExportConfig({
        format: 'xml',
        dateRange: {
          start: Date.now() - 7 * 24 * 60 * 60 * 1000,
          end: Date.now(),
        },
        userId: 'user-123',
      });
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('INVALID_FORMAT');
    });
    it('should reject missing userId', () => {
      const result = validateExportConfig({
        format: 'json',
        dateRange: {
          start: Date.now() - 7 * 24 * 60 * 60 * 1000,
          end: Date.now(),
        },
        userId: '',
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.code === 'MISSING_USER_ID')).toBe(
        true,
      );
    });
    it('should warn about unknown data types', () => {
      const result = validateExportConfig({
        format: 'json',
        dataTypes: ['sessions', 'unknown_type'],
        dateRange: {
          start: Date.now() - 7 * 24 * 60 * 60 * 1000,
          end: Date.now(),
        },
        userId: 'user-123',
      });
      expect(result.valid).toBe(true);
      expect(result.warnings[0].code).toBe('UNKNOWN_DATA_TYPE');
    });
    it('should not warn about large exports within limits', () => {
      const now = Date.now();
      const result = validateExportConfig({
        format: 'json',
        dataTypes: ['sessions', 'xp', 'streaks', 'boss', 'items'],
        dateRange: { start: now - 365 * 24 * 60 * 60 * 1000, end: now },
        userId: 'user-123',
      });
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.code === 'LARGE_EXPORT')).toBe(false);
    });
  });

  describe('validateInsight', () => {
    it('should validate correct insight', () => {
      const result = validateInsight({
        title: 'Test Insight',
        description: 'This is a test description',
        severity: 'info',
        metric: 'sessions_completed',
      });
      expect(result.valid).toBe(true);
      const sanitized = result.sanitized as { title: string } | undefined;
      expect(sanitized?.title).toBe('Test Insight');
    });
    it('should reject empty title', () => {
      const result = validateInsight({
        title: '',
        description: 'Description',
        severity: 'info',
        metric: 'sessions_completed',
      });
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('EMPTY_TITLE');
    });
    it('should reject title too long', () => {
      const result = validateInsight({
        title: 'a'.repeat(201),
        description: 'Description',
        severity: 'info',
        metric: 'sessions_completed',
      });
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('TITLE_TOO_LONG');
    });
    it('should reject invalid severity', () => {
      const result = validateInsight({
        title: 'Test',
        description: 'Description',
        severity: 'invalid',
        metric: 'sessions_completed',
      });
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('INVALID_SEVERITY');
    });
    it('should trim whitespace', () => {
      const result = validateInsight({
        title: '  Test Insight  ',
        description: '  Description  ',
        severity: 'info',
        metric: 'sessions_completed',
      });
      expect(result.valid).toBe(true);
      const sanitized = result.sanitized as { title: string } | undefined;
      expect(sanitized?.title).toBe('Test Insight');
    });
  });
});
