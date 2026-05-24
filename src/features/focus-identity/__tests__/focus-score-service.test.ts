import * as repository from '../repository-focus-score';
import {
  getCurrentFocusScore,
  getFocusScoreHistory,
} from '../focus-score-service';

jest.mock('../repository-focus-score');

const userId = '123e4567-e89b-12d3-a456-426614174000';

describe('focus score service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads the current score through the repository layer', async () => {
    jest.mocked(repository.fetchCurrentFocusScore).mockResolvedValue(null);

    await expect(getCurrentFocusScore(userId)).resolves.toBeNull();

    expect(repository.fetchCurrentFocusScore).toHaveBeenCalledWith(userId);
  });

  it('loads score history through the repository layer', async () => {
    jest.mocked(repository.fetchFocusScoreHistory).mockResolvedValue([]);

    await expect(getFocusScoreHistory(userId, 30)).resolves.toEqual([]);

    expect(repository.fetchFocusScoreHistory).toHaveBeenCalledWith(userId, 30);
  });
});
