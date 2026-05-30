/**
 * Service and formatTime tests for monthly-report feature
 */
import {
  generateMonthlyReport,
  MonthlyReportServiceError,
} from "../service";
import { formatTime } from "../components/report-content-helpers";

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

describe("generateMonthlyReport", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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
