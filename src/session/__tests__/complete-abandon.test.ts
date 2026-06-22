import {
  createTestContext,
  type TestContext,
} from './helpers';

let ctx: TestContext;

beforeEach(() => {
  jest.clearAllMocks();
  ctx = createTestContext();
});

describe('completeSession', () => {
  it('should complete session and return summary', async () => {
    const mockSummary = {
      sessionId: 'test-session-123',
      status: 'COMPLETED',
      xpEarned: 100,
      finalScore: 500,
      completionPercentage: 100,
    };
    ctx.mockOrchestrator.completeSession.mockResolvedValue(mockSummary);
    const summary = await ctx.mockOrchestrator.completeSession();
    expect(summary.status).toBe('COMPLETED');
    expect(summary.xpEarned).toBeGreaterThan(0);
  });

  it('should delegate completion to orchestrator', async () => {
    await ctx.mockOrchestrator.completeSession();
    expect(ctx.mockOrchestrator.completeSession).toHaveBeenCalled();
  });

  it('should handle partial completion', async () => {
    const mockSummary = {
      sessionId: 'test-session-123',
      status: 'COMPLETED',
      xpEarned: 25,
      finalScore: 250,
      completionPercentage: 50,
    };
    ctx.mockOrchestrator.completeSession.mockResolvedValue(mockSummary);
    const summary = await ctx.mockOrchestrator.completeSession();
    expect(summary.completionPercentage).toBe(50);
  });
});

describe('abandonSession', () => {
  it('should delegate abandon to orchestrator with reason', async () => {
    await ctx.mockOrchestrator.abandonSession('USER_CANCELLED');
    expect(ctx.mockOrchestrator.abandonSession).toHaveBeenCalledWith(
      'USER_CANCELLED',
    );
  });

  it('should delegate abandon without reason', async () => {
    await ctx.mockOrchestrator.abandonSession();
    expect(ctx.mockOrchestrator.abandonSession).toHaveBeenCalled();
  });

  it('should not call completeSession when abandoning', async () => {
    await ctx.mockOrchestrator.abandonSession('USER_CANCELLED');
    expect(ctx.mockOrchestrator.completeSession).not.toHaveBeenCalled();
  });
});
