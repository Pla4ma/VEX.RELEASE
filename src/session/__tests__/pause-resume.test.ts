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
    const emitter = require('../SessionEventEmitter').getSessionEventEmitter();
    expect(emitter.emitNotification).toHaveBeenCalledWith(
      'SESSION_PAUSED',
      'Session Paused',
      'USER_INITIATED',
      'normal',
    );
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
    const emitter = require('../SessionEventEmitter').getSessionEventEmitter();
    expect(emitter.emitNotification).toHaveBeenCalledWith(
      'SESSION_RESUMED',
      'Session Resumed',
      'Your session is now active',
      'normal',
    );
  });
});
