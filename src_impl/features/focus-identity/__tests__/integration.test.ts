
import { eventBus } from '../../../events';
import { initializeFocusIdentityIntegrations } from '../integration';
import * as repository from '../repository-focus-score';
import * as analytics from '../analytics';
import { queryClient } from '../../../api/QueryProvider';

jest.mock('../repository-focus-score');
jest.mock('../analytics');
jest.mock('../../../api/QueryProvider');

describe('Focus Identity Integration', () => {
  let cleanup: () => void;

  beforeEach(() => {
    cleanup = initializeFocusIdentityIntegrations();
    jest.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('should update focus score on session:completed event', async () => {
    const ledger = {
      userId: 'user-123',
      grade: 'A',
      mode: 'deep_work',
      completedAt: new Date().toISOString(),
    };

    (repository.fetchCurrentFocusScore as jest.Mock).mockResolvedValue({
      currentScore: 600,
    });
    (repository.upsertCurrentFocusScore as jest.Mock).mockResolvedValue({});
    (repository.appendFocusScoreHistory as jest.Mock).mockResolvedValue({});

    const eventBusSpy = jest.spyOn(eventBus, 'publish');

    await eventBus.publish('session:completed', { userId: 'user-123', ledger });

    // Need to wait for async operations to complete
    await new Promise(process.nextTick);

    expect(repository.fetchCurrentFocusScore).toHaveBeenCalledWith('user-123');
    expect(repository.upsertCurrentFocusScore).toHaveBeenCalled();
    expect(repository.appendFocusScoreHistory).toHaveBeenCalled();
    expect(analytics.trackFocusScoreChanged).toHaveBeenCalled();
    expect(eventBusSpy).toHaveBeenCalledWith('focus-identity:score_updated', expect.any(Object));
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['focus-score', 'user-123', 'current'] });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['focus-score', 'user-123', 'history'] });
  });
});
