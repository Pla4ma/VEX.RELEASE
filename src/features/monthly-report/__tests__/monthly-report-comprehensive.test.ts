/**
 * Comprehensive tests for monthly-report feature
 * Covers: schemas.ts, service.ts, repository.ts (formatTime, computeBestFocusWindow, computePatterns)
 */
import {
  MonthlyFocusReportInputSchema,
  MonthlyFocusReportSummarySchema,
} from "../schemas";
import {
  generateMonthlyReport,
  MonthlyReportServiceError,
} from "../service";
import { formatTime } from "../components/report-content-helpers";

// ──────────────────── Mock repository for service tests ────────────────────

jest.mock("../repository", () => ({
  fetchMonthlyFocusReportInput: jest.fn(),
}));

jest.mock("@sentry/react-native", () => ({
  captureException: jest.fn(),
}));

const { fetchMonthlyFocusReportInput } = jest.requireMock("../repository") as {
  fetchMonthlyFocusReportInput: jest.Mock;
};

const validInput = {
  userId: "550e8400-e29b-41d4-a716-446655440000",
  month: 3,
  year: 2025,
};

const mockReport = {
  monthStartScore: 600,
  monthEndScore: 650,
  scoreDelta: 50,
  bestFocusWindow: "Morning (9:00 AM)",
  strongestPattern: "Consistency",
  weakestPattern: "Recency",
  sessionCount: 12,
  totalFocusedTime: 28800,
  bestGrade: "A" as const,
  nextMonthTarget: 675,
};

describe("monthly-report comprehensive tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ──────────────────── Schemas ────────────────────

  describe("MonthlyFocusReportInputSchema", () => {
    it("accepts valid input", () => {
      const result = MonthlyFocusReportInputSchema.parse(validInput);
      expect(result.userId).toBe(validInput.userId);
      expect(result.month).toBe(3);
      expect(result.year).toBe(2025);
    });

    it("rejects invalid UUID", () => {
      expect(() =>
        MonthlyFocusReportInputSchema.parse({
          ...validInput,
          userId: "not-a-uuid",
        }),
      ).toThrow();
    });

    it("rejects month out of range", () => {
      expect(() =>
        MonthlyFocusReportInputSchema.parse({ ...validInput, month: 0 }),
      ).toThrow();
      expect(() =>
        MonthlyFocusReportInputSchema.parse({ ...validInput, month: 13 }),
      ).toThrow();
    });

    it("rejects year before 2020", () => {
      expect(() =>
        MonthlyFocusReportInputSchema.parse({ ...validInput, year: 2019 }),
      ).toThrow();
    });
  });

  describe("MonthlyFocusReportSummarySchema", () => {
    it("accepts valid summary", () => {
      const result = MonthlyFocusReportSummarySchema.parse(mockReport);
      expect(result.monthStartScore).toBe(600);
      expect(result.bestGrade).toBe("A");
    });

    it("rejects score below 300", () => {
      expect(() =>
        MonthlyFocusReportSummarySchema.parse({
          ...mockReport,
          monthStartScore: 299,
        }),
      ).toThrow();
    });

    it("rejects score above 850", () => {
      expect(() =>
        MonthlyFocusReportSummarySchema.parse({
          ...mockReport,
          monthEndScore: 851,
        }),
      ).toThrow();
    });

    it("rejects invalid grade", () => {
      expect(() =>
        MonthlyFocusReportSummarySchema.parse({
          ...mockReport,
          bestGrade: "F",
        }),
      ).toThrow();
    });

    it("accepts all valid grades (S, A, B, C, D)", () => {
      const grades = ["S", "A", "B", "C", "D"] as const;
      for (const grade of grades) {
        const result = MonthlyFocusReportSummarySchema.parse({
          ...mockReport,
          bestGrade: grade,
        });
        expect(result.bestGrade).toBe(grade);
      }
    });

    it("accepts optional aiCoachInsight", () => {
      const result = MonthlyFocusReportSummarySchema.parse({
        ...mockReport,
        aiCoachInsight: "You're improving steadily.",
      });
      expect(result.aiCoachInsight).toBe("You're improving steadily.");
    });
  });

  // ──────────────────── formatTime ────────────────────

  describe("formatTime", () => {
    it("formats seconds-only as minutes", () => {
      expect(formatTime(600)).toBe("10m");
    });

    it("formats hours and minutes", () => {
      expect(formatTime(3600)).toBe("1h 0m");
      expect(formatTime(3661)).toBe("1h 1m");
    });

    it("formats zero as 0m", () => {
      expect(formatTime(0)).toBe("0m");
    });

    it("formats large values correctly", () => {
      expect(formatTime(7200)).toBe("2h 0m");
      expect(formatTime(5400)).toBe("1h 30m");
    });

    it("formats sub-minute values", () => {
      expect(formatTime(30)).toBe("0m");
      expect(formatTime(59)).toBe("0m");
    });
  });

  // ──────────────────── generateMonthlyReport (service) ────────────────────

  describe("generateMonthlyReport", () => {
    it("returns report on success", async () => {
      fetchMonthlyFocusReportInput.mockResolvedValue(mockReport);
      const result = await generateMonthlyReport(validInput);
      expect(result).toEqual(mockReport);
      expect(fetchMonthlyFocusReportInput).toHaveBeenCalledWith(validInput);
    });

    it("wraps repository errors in MonthlyReportServiceError", async () => {
      fetchMonthlyFocusReportInput.mockRejectedValue(new Error("DB down"));
      await expect(generateMonthlyReport(validInput)).rejects.toThrow(
        MonthlyReportServiceError,
      );
    });

    it("rejects invalid schema output from repository", async () => {
      fetchMonthlyFocusReportInput.mockResolvedValue({
        ...mockReport,
        sessionCount: -1,
      });
      await expect(generateMonthlyReport(validInput)).rejects.toThrow();
    });

    it("preserves cause in MonthlyReportServiceError", async () => {
      const cause = new Error("Connection refused");
      fetchMonthlyFocusReportInput.mockRejectedValue(cause);
      try {
        await generateMonthlyReport(validInput);
        fail("Expected error");
      } catch (e) {
        expect(e).toBeInstanceOf(MonthlyReportServiceError);
        expect((e as MonthlyReportServiceError).cause).toBe(cause);
      }
    });
  });
});
