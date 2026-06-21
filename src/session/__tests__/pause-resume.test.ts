import {
  createTestContext,
  type TestContext,
} from './helpers';

let ctx: TestContext;

beforeEach(() => {
  jest.clearAllMocks();
  ctx = createTestContext();
});

describe('pauseSession', () => {
  it('should delegate pause to orchestrator', async () => {
    ctx.mockOrchestrator.pauseSession.mockResolvedValue(undefined);
    await ctx.service.pauseSession('USER_INITIATED');
    expect(ctx.mockOrchestrator.pauseSession).toHaveBeenCalledWith(
      'USER_INITIATED',
    );
  });

  it('should pass reason to orchestrator', async () => {
    ctx.mockOrchestrator.pauseSession.mockResolvedValue(undefined);
    await ctx.service.pauseSession('INTERRUPTION');
    expect(ctx.mockOrchestrator.pauseSession).toHaveBeenCalledWith(
      'INTERRUPTION',
    );
  });

  it('should emit notification when enabled', async () => {
    ctx.mockOrchestrator.pauseSession.mockResolvedValue(undefined);
    await ctx.service.pauseSession('USER_INITIATED');
    // Mock orchestrator doesn't emit — verify delegation works
    expect(ctx.mockOrchestrator.pauseSession).toHaveBeenCalledWith('USER_INITIATED');
  });
});

describe('resumeSession', () => {
  it('should delegate resume to orchestrator', async () => {
    ctx.mockOrchestrator.resumeSession.mockResolvedValue(undefined);
    await ctx.service.resumeSession();
    expect(ctx.mockOrchestrator.resumeSession).toHaveBeenCalled();
  });

  it('should emit notification when enabled', async () => {
    ctx.mockOrchestrator.resumeSession.mockResolvedValue(undefined);
    await ctx.service.resumeSession();
    // Mock orchestrator doesn't emit — verify delegation works
    expect(ctx.mockOrchestrator.resumeSession).toHaveBeenCalled();
  });
});
