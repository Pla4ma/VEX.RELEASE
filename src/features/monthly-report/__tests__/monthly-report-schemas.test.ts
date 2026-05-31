/**
 * Schema tests for monthly-report feature
 */
import {
  MonthlyFocusReportInputSchema,
  MonthlyFocusReportSummarySchema,
} from '../schemas';

jest.mock('../repository', () => ({
  fetchMonthlyFocusReportInput: jest.fn(),
}));

jest.mock('@sentry/react-native', () => ({
  captureException: jest.fn(),
}));

const validInput = {
  userId: '550e8400-e29b-41d4-a716-446655440000',
  month: 3,
  year: 2025,
};

const mockReport = {
  monthStartScore: 600,
  monthEndScore: 650,
  scoreDelta: 50,
  bestFocusWindow: 'Morning (9:00 AM)',
  strongestPattern: 'Consistency',
  weakestPattern: 'Recency',
  sessionCount: 12,
  totalFocusedTime: 28800,
  bestGrade: 'A' as const,
  nextMonthTarget: 675,
};

describe('MonthlyFocusReportInputSchema', () => {
  it('accepts valid input', () => {
    const result = MonthlyFocusReportInputSchema.parse(validInput);
    expect(result.userId).toBe(validInput.userId);
    expect(result.month).toBe(3);
    expect(result.year).toBe(2025);
  });

  it('rejects invalid UUID', () => {
    expect(() =>
      MonthlyFocusReportInputSchema.parse({
        ...validInput,
        userId: 'not-a-uuid',
      }),
    ).toThrow();
  });

  it('rejects month out of range', () => {
    expect(() =>
      MonthlyFocusReportInputSchema.parse({ ...validInput, month: 0 }),
    ).toThrow();
    expect(() =>
      MonthlyFocusReportInputSchema.parse({ ...validInput, month: 13 }),
    ).toThrow();
  });

  it('rejects year before 2020', () => {
    expect(() =>
      MonthlyFocusReportInputSchema.parse({ ...validInput, year: 2019 }),
    ).toThrow();
  });
});

describe('MonthlyFocusReportSummarySchema', () => {
  it('accepts valid summary', () => {
    const result = MonthlyFocusReportSummarySchema.parse(mockReport);
    expect(result.monthStartScore).toBe(600);
    expect(result.bestGrade).toBe('A');
  });

  it('rejects score below 300', () => {
    expect(() =>
      MonthlyFocusReportSummarySchema.parse({
        ...mockReport,
        monthStartScore: 299,
      }),
    ).toThrow();
  });

  it('rejects score above 850', () => {
    expect(() =>
      MonthlyFocusReportSummarySchema.parse({
        ...mockReport,
        monthEndScore: 851,
      }),
    ).toThrow();
  });

  it('rejects invalid grade', () => {
    expect(() =>
      MonthlyFocusReportSummarySchema.parse({
        ...mockReport,
        bestGrade: 'F',
      }),
    ).toThrow();
  });

  it('accepts all valid grades (S, A, B, C, D)', () => {
    const grades = ['S', 'A', 'B', 'C', 'D'] as const;
    for (const grade of grades) {
      const result = MonthlyFocusReportSummarySchema.parse({
        ...mockReport,
        bestGrade: grade,
      });
      expect(result.bestGrade).toBe(grade);
    }
  });

  it('accepts optional aiCoachInsight', () => {
    const result = MonthlyFocusReportSummarySchema.parse({
      ...mockReport,
      aiCoachInsight: "You're improving steadily.",
    });
    expect(result.aiCoachInsight).toBe("You're improving steadily.");
  });
});
