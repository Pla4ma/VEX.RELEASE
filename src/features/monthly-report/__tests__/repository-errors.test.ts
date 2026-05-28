import {
  fetchMonthlyFocusReportInput,
  MonthlyReportRepositoryError,
} from "../repository";
import { mockSelect } from "./test-setup";

describe("fetchMonthlyFocusReportInput — error and empty handling", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("throws MonthlyReportRepositoryError on Supabase error", async () => {
    mockSelect.mockReturnValue({
      eq: jest.fn().mockReturnValue({
        gte: jest.fn().mockReturnValue({
          lte: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: null,
              error: { message: "DB error", code: "XX000" },
            }),
          }),
        }),
      }),
    });

    await expect(
      fetchMonthlyFocusReportInput({
        userId: "550e8400-e29b-41d4-a716-446655440000",
        month: 3,
        year: 2025,
      }),
    ).rejects.toThrow(MonthlyReportRepositoryError);
  });

  it("handles empty sessions gracefully", async () => {
    const scoreData = [{ score: 550, created_at: "2025-03-01T00:00:00Z" }];
    const factors = {};

    mockSelect
      .mockReturnValueOnce({
        eq: jest.fn().mockReturnValue({
          gte: jest.fn().mockReturnValue({
            lte: jest.fn().mockReturnValue({
              order: jest
                .fn()
                .mockResolvedValue({ data: scoreData, error: null }),
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        eq: jest.fn().mockReturnValue({
          gte: jest.fn().mockReturnValue({
            lte: jest.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      })
      .mockReturnValueOnce({
        eq: jest.fn().mockReturnValue({
          single: jest
            .fn()
            .mockResolvedValue({ data: { factors }, error: null }),
        }),
      });

    const result = await fetchMonthlyFocusReportInput({
      userId: "550e8400-e29b-41d4-a716-446655440000",
      month: 3,
      year: 2025,
    });

    expect(result.sessionCount).toBe(0);
    expect(result.bestFocusWindow).toBe("No data");
    expect(result.strongestPattern).toBe("No data");
  });
});
