/**
 * Input Schema & getTimeRangeDates Tests
 */

import {
  GetAnalyticsDataInputSchema,
  CreateInsightInputSchema,
  CreateExportJobInputSchema,
  UpdateDashboardWidgetInputSchema,
  getTimeRangeDates,
} from '../input-schemas';

// ── Input Schema Tests ────────────────────────────────────────────────────────

describe('Input Schemas', () => {
  describe('GetAnalyticsDataInputSchema', () => {
    const validInput = {
      userId: '550e8400-e29b-41d4-a716-446655440000',
      metrics: ['sessions_completed'],
      timeRange: 'last_7_days',
      granularity: 'day',
    };

    it('accepts valid input', () => {
      expect(() => GetAnalyticsDataInputSchema.parse(validInput)).not.toThrow();
    });

    it('rejects empty metrics', () => {
      expect(() =>
        GetAnalyticsDataInputSchema.parse({ ...validInput, metrics: [] }),
      ).toThrow();
    });

    it('rejects extra fields (strict)', () => {
      expect(() =>
        GetAnalyticsDataInputSchema.parse({
          ...validInput,
          extraField: true,
        }),
      ).toThrow();
    });
  });

  describe('CreateInsightInputSchema', () => {
    const validInput = {
      userId: '550e8400-e29b-41d4-a716-446655440000',
      type: 'milestone_reached',
      severity: 'celebration',
      title: '500 XP!',
      description: 'You earned 500 XP total',
      metric: 'xp_earned',
    };

    it('accepts valid input', () => {
      expect(() => CreateInsightInputSchema.parse(validInput)).not.toThrow();
    });

    it('applies default expiresInDays', () => {
      const parsed = CreateInsightInputSchema.parse(validInput);
      expect(parsed.expiresInDays).toBe(30);
    });

    it('applies default relatedMetrics', () => {
      const parsed = CreateInsightInputSchema.parse(validInput);
      expect(parsed.relatedMetrics).toEqual([]);
    });
  });

  describe('CreateExportJobInputSchema', () => {
    const validInput = {
      userId: '550e8400-e29b-41d4-a716-446655440000',
      format: 'json',
      dataTypes: ['sessions'],
      dateRange: { start: Date.now() - 86400000, end: Date.now() },
    };

    it('accepts valid input', () => {
      expect(() => CreateExportJobInputSchema.parse(validInput)).not.toThrow();
    });

    it('rejects empty dataTypes', () => {
      expect(() =>
        CreateExportJobInputSchema.parse({ ...validInput, dataTypes: [] }),
      ).toThrow();
    });
  });

  describe('UpdateDashboardWidgetInputSchema', () => {
    const validInput = {
      widgetId: '550e8400-e29b-41d4-a716-446655440000',
      userId: '550e8400-e29b-41d4-a716-446655440001',
      updates: {
        title: 'New Title',
      },
    };

    it('accepts valid input', () => {
      expect(() =>
        UpdateDashboardWidgetInputSchema.parse(validInput),
      ).not.toThrow();
    });

    it('accepts empty updates (all fields optional)', () => {
      expect(() =>
        UpdateDashboardWidgetInputSchema.parse({
          ...validInput,
          updates: {},
        }),
      ).not.toThrow();
    });
  });
});

// ── getTimeRangeDates ─────────────────────────────────────────────────────────

describe('getTimeRangeDates', () => {
  it('returns start and end for today', () => {
    const { start, end } = getTimeRangeDates('today');
    expect(start).toBeLessThanOrEqual(end);
    expect(end).toBeLessThanOrEqual(Date.now() + 1000);
  });

  it('returns correct range for last_7_days', () => {
    const { start, end } = getTimeRangeDates('last_7_days');
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    const rangeMs = end - start;
    expect(rangeMs).toBeGreaterThanOrEqual(sevenDaysMs - 1000);
    expect(rangeMs).toBeLessThanOrEqual(sevenDaysMs + 1000);
  });

  it('returns correct range for last_30_days', () => {
    const { start, end } = getTimeRangeDates('last_30_days');
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    const rangeMs = end - start;
    expect(rangeMs).toBeGreaterThanOrEqual(thirtyDaysMs - 1000);
  });

  it('returns start=0 for all_time', () => {
    const { start } = getTimeRangeDates('all_time');
    expect(start).toBe(0);
  });

  it('returns valid range for this_week', () => {
    const { start, end } = getTimeRangeDates('this_week');
    expect(start).toBeLessThanOrEqual(end);
    expect(end).toBeLessThanOrEqual(Date.now() + 1000);
  });

  it('returns valid range for this_month', () => {
    const { start, end } = getTimeRangeDates('this_month');
    expect(start).toBeLessThanOrEqual(end);
  });

  it('returns valid range for this_year', () => {
    const { start, end } = getTimeRangeDates('this_year');
    expect(start).toBeLessThanOrEqual(end);
  });

  it('returns valid range for yesterday', () => {
    const { start, end } = getTimeRangeDates('yesterday');
    expect(start).toBeLessThan(end);
    // Yesterday should be before today
    const { start: todayStart } = getTimeRangeDates('today');
    expect(start).toBeLessThan(todayStart);
  });

  it('defaults to 7-day range for custom', () => {
    const { start, end } = getTimeRangeDates('custom');
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    const rangeMs = end - start;
    expect(rangeMs).toBeGreaterThanOrEqual(sevenDaysMs - 1000);
  });
});
