import { describe, it, expect } from '@jest/globals';
import { filterV1ContentTypes, getV1DefaultContentTypes, isV1HiddenContentType } from '../../features/notifications/SmartNotificationV1Filter';

describe('SmartNotificationV1Filter', () => {
  it('filters out RANK_REPORT from content types', () => {
    const result = filterV1ContentTypes(['STREAK', 'RANK_REPORT', 'BOSS']);
    expect(result).toEqual(['STREAK', 'BOSS']);
    expect(result).not.toContain('RANK_REPORT');
  });

  it('keeps STREAK, BOSS, and POSITIVE', () => {
    const result = filterV1ContentTypes(['STREAK', 'BOSS', 'POSITIVE']);
    expect(result).toContain('STREAK');
    expect(result).toContain('BOSS');
    expect(result).toContain('POSITIVE');
  });

  it('returns empty array for all-hidden types', () => {
    const result = filterV1ContentTypes(['RANK_REPORT']);
    expect(result).toEqual([]);
  });

  it('getV1DefaultContentTypes excludes hidden types', () => {
    const defaults = getV1DefaultContentTypes();
    expect(defaults).not.toContain('RANK_REPORT');
    expect(defaults).toContain('STREAK');
    expect(defaults).toContain('BOSS');
    expect(defaults).toContain('POSITIVE');
  });

  it('isV1HiddenContentType identifies RANK_REPORT as hidden', () => {
    expect(isV1HiddenContentType('RANK_REPORT')).toBe(true);
  });

  it('isV1HiddenContentType returns false for allowed types', () => {
    expect(isV1HiddenContentType('STREAK')).toBe(false);
    expect(isV1HiddenContentType('BOSS')).toBe(false);
    expect(isV1HiddenContentType('POSITIVE')).toBe(false);
    expect(isV1HiddenContentType('COMEBACK')).toBe(false);
  });
});
