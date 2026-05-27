import { createTestContext, mockSessionConfig, mockUserId, type TestContext } from './helpers';
import { eventBus } from '../../events';

let ctx: TestContext;

beforeEach(() => {
  jest.clearAllMocks();
  ctx = createTestContext();
});

describe('getSessionState', () => {
  it('should return current session state', async () => {
    const session = await ctx.service.createSession(mockSessionConfig);
    const state = ctx.service.getSessionState(session.id);
    expect(state).toBeDefined();
    expect(state.sessionId).toBe(session.id);
    expect(state.status).toBe('CREATED');
  });

  it('should calculate remaining time correctly', async () => {
    const session = await ctx.service.createSession(mockSessionConfig);
    await ctx.service.startSession(session.id);
    const state = ctx.service.getSessionState(session.id);
    expect(state.remainingSeconds).toBeLessThanOrEqual(session.config.duration);
    expect(state.remainingSeconds).toBeGreaterThan(0);
  });
});

describe('error handling', () => {
  it('should handle repository save failure', async () => {
    ctx.mockRepository.saveSession.mockRejectedValue(new Error('DB error'));
    await expect(ctx.service.createSession(mockSessionConfig)).rejects.toThrow('DB error');
    expect(eventBus.publish).toHaveBeenCalledWith(
      'session:failed',
      expect.objectContaining({ canRecover: true }),
    );
  });

  it('should handle concurrent session operations', async () => {
    const session = await ctx.service.createSession(mockSessionConfig);
    await ctx.service.startSession(session.id);
    const pause1 = ctx.service.pauseSession(session.id, { reason: 'TEST' });
    const pause2 = ctx.service.pauseSession(session.id, { reason: 'TEST' });
    await expect(Promise.all([pause1, pause2])).rejects.toThrow();
  });
});

describe('session history', () => {
  it('should retrieve session history', async () => {
    const mockHistory = [
      { id: 'session-1', status: 'COMPLETED', startedAt: Date.now() - 86400000 },
      { id: 'session-2', status: 'COMPLETED', startedAt: Date.now() - 172800000 },
    ];
    ctx.mockRepository.getSessionHistory.mockResolvedValue(mockHistory);
    const history = await ctx.service.getSessionHistory(mockUserId, { limit: 10 });
    expect(history).toHaveLength(2);
    expect(ctx.mockRepository.getSessionHistory).toHaveBeenCalledWith(mockUserId, { limit: 10 });
  });
});
