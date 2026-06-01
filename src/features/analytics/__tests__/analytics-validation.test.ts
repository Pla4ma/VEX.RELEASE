/**
 * Validation Tests: validateTimeRange, validateMetrics, validateInsight
 */

import {
  validateTimeRange,
  validateMetrics,
  validateInsight,
} from '../validation';

// ── Validation: validateTimeRange ─────────────────────────────────────────────

describe('Validation: validateTimeRange', () => {
  it('accepts valid range', () => {
    const now = Date.now();
    const result = validateTimeRange(now - 86400000, now);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.sanitized).toBeDefined();
  });

  it('rejects negative startDate', () => {
    const result = validateTimeRange(-1, Date.now());
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === 'INVALID_TIMESTAMP')).toBe(
      true,
    );
  });

  it('rejects inverted range', () => {
    const now = Date.now();
    const result = validateTimeRange(now, now - 86400000);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === 'INVERTED_RANGE')).toBe(true);
  });

  it('warns on future end date', () => {
    const now = Date.now();
    const result = validateTimeRange(now - 86400000, now + 120000);
    expect(result.warnings.some((w) => w.code === 'FUTURE_DATE')).toBe(true);
  });

  it('rejects range exceeding max days', () => {
    const now = Date.now();
    const result = validateTimeRange(now - 400 * 86400000, now, 365);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === 'RANGE_TOO_LARGE')).toBe(true);
  });

  it('warns on very old data', () => {
    const now = Date.now();
    const twoYearsAgo = now - 2 * 365 * 86400000;
    const result = validateTimeRange(twoYearsAgo, twoYearsAgo + 60 * 86400000);
    expect(result.warnings.some((w) => w.code === 'VERY_OLD_DATA')).toBe(true);
  });

  it('uses custom maxRangeDays', () => {
    const now = Date.now();
    const result = validateTimeRange(now - 10 * 86400000, now, 5);
    expect(result.valid).toBe(false);
  });
});

// ── Validation: validateMetrics ───────────────────────────────────────────────

describe('Validation: validateMetrics', () => {
  it('accepts valid metrics', () => {
    const result = validateMetrics(['sessions_completed', 'xp_earned']);
    expect(result.valid).toBe(true);
    expect(result.sanitized).toBeDefined();
  });

  it('rejects empty array', () => {
    const result = validateMetrics([]);
    expect(result.valid).toBe(false);
    expect(result.errors[0]!.code).toBe('EMPTY_SELECTION');
  });

  it('rejects invalid metrics', () => {
    const result = validateMetrics(['invalid_metric']);
    expect(result.valid).toBe(false);
    expect(result.errors[0]!.code).toBe('INVALID_METRICS');
  });

  it('warns on too many metrics', () => {
    const metrics = [
      'sessions_completed',
      'sessions_abandoned',
      'total_focus_time',
      'average_session_duration',
      'streak_days',
      'longest_streak',
      'xp_earned',
      'level_progression',
      'boss_damage_dealt',
      'items_crafted',
      'coins_spent',
    ];
    const result = validateMetrics(metrics);
    expect(result.warnings.some((w) => w.code === 'TOO_MANY_METRICS')).toBe(
      true,
    );
  });

  it('warns on duplicate metrics', () => {
    const result = validateMetrics([
      'sessions_completed',
      'sessions_completed',
    ]);
    expect(result.warnings.some((w) => w.code === 'DUPLICATE_METRIC')).toBe(
      true,
    );
  });
});

// ── Validation: validateInsight ───────────────────────────────────────────────

describe('Validation: validateInsight', () => {
  const validInsight = {
    title: '500 XP Milestone!',
    description: 'You earned 500 total XP.',
    severity: 'celebration',
    metric: 'xp_earned',
  };

  it('accepts valid insight', () => {
    const result = validateInsight(validInsight);
    expect(result.valid).toBe(true);
  });

  it('rejects empty title', () => {
    const result = validateInsight({ ...validInsight, title: '' });
    expect(result.valid).toBe(false);
    expect(result.errors[0]!.code).toBe('EMPTY_TITLE');
  });

  it('rejects title > 200 chars', () => {
    const result = validateInsight({
      ...validInsight,
      title: 'a'.repeat(201),
    });
    expect(result.valid).toBe(false);
    expect(result.errors[0]!.code).toBe('TITLE_TOO_LONG');
  });

  it('rejects empty description', () => {
    const result = validateInsight({ ...validInsight, description: '' });
    expect(result.valid).toBe(false);
    expect(result.errors[0]!.code).toBe('EMPTY_DESCRIPTION');
  });

  it('warns on long description', () => {
    const result = validateInsight({
      ...validInsight,
      description: 'a'.repeat(2001),
    });
    expect(result.warnings.some((w) => w.code === 'DESCRIPTION_LONG')).toBe(
      true,
    );
  });

  it('rejects invalid severity', () => {
    const result = validateInsight({ ...validInsight, severity: 'emergency' });
    expect(result.valid).toBe(false);
    expect(result.errors[0]!.code).toBe('INVALID_SEVERITY');
  });

  it('warns on untracked metric', () => {
    const result = validateInsight({
      ...validInsight,
      metric: 'social_interactions',
    });
    expect(result.warnings.some((w) => w.code === 'UNKNOWN_METRIC')).toBe(
      true,
    );
  });
});
