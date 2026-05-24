import { generateMonthlyReport, MonthlyReportServiceError } from '../service';

jest.mock('../repository', () => ({
  fetchMonthlyFocusReportInput: jest.fn(),
}));

jest.mock('../../../config/sentry', () => ({
  captureException: jest.fn(),
}));

const { fetchMonthlyFocusReportInput } = jest.requireMock('../repository') as {
  fetchMonthlyFocusReportInput: jest.Mock;
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
  bestGrade: 'A',
  nextMonthTarget: 675,
};

describe('generateMonthlyReport', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns report on success', async () => {
    fetchMonthlyFocusReportInput.mockResolvedValue(mockReport);

    const result = await generateMonthlyReport({
      userId: '550e8400-e29b-41d4-a716-446655440000',
      month: 3,
      year: 2025,
    });

    expect(result).toEqual(mockReport);
    expect(fetchMonthlyFocusReportInput).toHaveBeenCalledWith({
      userId: '550e8400-e29b-41d4-a716-446655440000',
      month: 3,
      year: 2025,
    });
  });

  it('throws MonthlyReportServiceError on repository failure', async () => {
    fetchMonthlyFocusReportInput.mockRejectedValue(new Error('DB down'));

    await expect(
      generateMonthlyReport({
        userId: '550e8400-e29b-41d4-a716-446655440000',
        month: 3,
        year: 2025,
      })
    ).rejects.toThrow(MonthlyReportServiceError);
  });

  it('validates output against schema', async () => {
    fetchMonthlyFocusReportInput.mockResolvedValue({
      ...mockReport,
      sessionCount: -1,
    });

    await expect(
      generateMonthlyReport({
        userId: '550e8400-e29b-41d4-a716-446655440000',
        month: 3,
        year: 2025,
      })
    ).rejects.toThrow();
  });
});
