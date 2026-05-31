import {
  createTestContext,
  mockSessionConfig,
  mockUserId,
  type TestContext,
} from './helpers';

let ctx: TestContext;

beforeEach(() => {
  jest.clearAllMocks();
  ctx = createTestContext();
});

describe('getCurrentSession', () => {
  it('should return current session from orchestrator', () => {
    const mockSession = { id: 'session-1', status: 'CREATED' };
    ctx.mockOrchestrator.getSession.mockReturnValue(mockSession);
    const state = ctx.service.getCurrentSession();
    expect(state).toBeDefined();
    expect(state?.id).toBe('session-1');
  });

  it('should return null when no session', () => {
    ctx.mockOrchestrator.getSession.mockReturnValue(null);
    const state = ctx.service.getCurrentSession();
    expect(state).toBeNull();
  });
});

describe('error handling', () => {
  it('should handle repository save failure', async () => {
    ctx.mockRepository.getActiveSession.mockResolvedValue(null);
    ctx.mockOrchestrator.isSessionActive.mockReturnValue(false);
    ctx.mockOrchestrator.createSession.mockRejectedValue(
      new Error('DB error'),
    );
    await expect(
      ctx.service.createCustomSession(mockSessionConfig),
    ).rejects.toThrow('DB error');
  });

  it('should throw error when no user is set', async () => {
    const serviceWithoutUser =
      new (require('../SessionService').SessionService)();
    await expect(
      serviceWithoutUser.createCustomSession(mockSessionConfig),
    ).rejects.toThrow('SessionService: No user set');
  });
});

describe('session history', () => {
  it('should retrieve session history with limit', async () => {
    const mockHistory = [
      {
        id: 'session-1',
        status: 'COMPLETED',
        startedAt: Date.now() - 86400000,
      },
      {
        id: 'session-2',
        status: 'COMPLETED',
        startedAt: Date.now() - 172800000,
      },
    ];
    ctx.mockRepository.getSessionHistory.mockResolvedValue(mockHistory);
    const history = await ctx.service.getSessionHistory(10);
    expect(history).toHaveLength(2);
    expect(ctx.mockRepository.getSessionHistory).toHaveBeenCalledWith(10);
  });
});
