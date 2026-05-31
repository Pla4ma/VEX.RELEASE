import { eventBus } from '../../../events';
import { initializeFocusIdentityIntegrations } from '../integration';
import * as repository from '../repository-focus-score';
import * as analytics from '../analytics';
import { queryClient } from '../../../api/QueryProvider';

jest.mock('../repository-focus-score');
jest.mock('../analytics');
jest.mock('../../../api/QueryProvider');
jest.mock('../../liveops-config/feature-access-store', () => ({
  getAvailabilityFor: jest.fn().mockReturnValue({
    state: 'unlocked',
    canRenderEntryPoint: true,
    canNavigate: true,
    canQuery: true,
    canRegisterRoute: true,
    canSubscribeToEvents: true,
    canExpose: true,
    canShowTeaser: false,
    snapshot: {},
  }),
}));

describe('Focus Identity Integration', () => {
  let cleanup: () => void;

  beforeEach(() => {
    cleanup = initializeFocusIdentityIntegrations();
    jest.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('should NOT subscribe to session:completed after architecture change — orchestrator owns focus score update', async () => {
    const eventBusSpy = jest.spyOn(eventBus, 'subscribe');

    await eventBus.publish('session:completed', {
      userId: 'user-123',
      ledger: {
        userId: 'user-123',
        grade: 'A',
        mode: 'deep_work',
        completedAt: new Date().toISOString(),
      },
    });

    await new Promise(process.nextTick);

    expect(repository.fetchCurrentFocusScore).not.toHaveBeenCalled();
    expect(repository.upsertCurrentFocusScore).not.toHaveBeenCalled();
    expect(eventBusSpy).not.toHaveBeenCalledWith(
      'focus-identity:score_updated',
      expect.any(Object),
    );
  });

  it('cleanup function is a no-op (integration permanently disabled)', () => {
    const fn = initializeFocusIdentityIntegrations();
    expect(() => fn()).not.toThrow();
  });
});
