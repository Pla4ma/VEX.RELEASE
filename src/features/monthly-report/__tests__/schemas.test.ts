import {
  MonthlyFocusReportInputSchema,
  MonthlyFocusReportSummarySchema,
} from '../schemas';

describe('MonthlyFocusReportInputSchema', () => {
  const validInput = {
    userId: '550e8400-e29b-41d4-a716-446655440000',
    month: 6,
    year: 2024,
  };

  it('validates correct input', () => {
    expect(MonthlyFocusReportInputSchema.safeParse(validInput).success).toBe(true);
  });

  it('requires valid UUID for userId', () => {
    expect(MonthlyFocusReportInputSchema.safeParse({ ...validInput, userId: 'not-uuid' }).success).toBe(false);
  });

  it('requires month between 1 and 12', () => {
    expect(MonthlyFocusReportInputSchema.safeParse({ ...validInput, month: 0 }).success).toBe(false);
    expect(MonthlyFocusReportInputSchema.safeParse({ ...validInput, month: 13 }).success).toBe(false);
  });

  it('requires year >= 2020', () => {
    expect(MonthlyFocusReportInputSchema.safeParse({ ...validInput, year: 2019 }).success).toBe(false);
  });
});

describe('MonthlyFocusReportSummarySchema', () => {
  const validSummary = {
    monthStartScore: 500,
    monthEndScore: 600,
    scoreDelta: 100,
    bestFocusWindow: '9am-11am',
    strongestPattern: 'Deep work',
    weakestPattern: 'Morning starts',
    sessionCount: 20,
    totalFocusedTime: 3600,
    bestGrade: 'S',
    nextMonthTarget: 650,
  };

  it('validates correct summary', () => {
    expect(MonthlyFocusReportSummarySchema.safeParse(validSummary).success).toBe(true);
  });

  it('requires scores between 300 and 850', () => {
    expect(MonthlyFocusReportSummarySchema.safeParse({ ...validSummary, monthStartScore: 299 }).success).toBe(false);
    expect(MonthlyFocusReportSummarySchema.safeParse({ ...validSummary, monthEndScore: 851 }).success).toBe(false);
  });

  it('requires valid grade', () => {
    expect(MonthlyFocusReportSummarySchema.safeParse({ ...validSummary, bestGrade: 'F' }).success).toBe(false);
  });

  it('allows optional aiCoachInsight', () => {
    expect(MonthlyFocusReportSummarySchema.safeParse({ ...validSummary, aiCoachInsight: 'Great progress!' }).success).toBe(true);
    expect(MonthlyFocusReportSummarySchema.safeParse(validSummary).success).toBe(true);
  });

  it('requires non-negative sessionCount and totalFocusedTime', () => {
    expect(MonthlyFocusReportSummarySchema.safeParse({ ...validSummary, sessionCount: -1 }).success).toBe(false);
    expect(MonthlyFocusReportSummarySchema.safeParse({ ...validSummary, totalFocusedTime: -1 }).success).toBe(false);
  });
});
