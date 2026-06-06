import { fetchProgressionEnhanced } from '../repository/progression-repository';
import { getProgressionSummaryEnhanced } from '../service-read';

jest.mock('../repository/progression-repository');

const userId = '123e4567-e89b-12d3-a456-426614174000';

describe('progression read service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns starter progression when backend sync fails', async () => {
    jest.mocked(fetchProgressionEnhanced).mockResolvedValue({
      data: null,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Progress needs a sync',
        isRetryable: true,
      },
    });

    await expect(getProgressionSummaryEnhanced(userId)).resolves.toEqual({
      level: 1,
      xp: 0,
      nextLevelThreshold: 100,
      progressPercent: 0,
    });
  });
});
