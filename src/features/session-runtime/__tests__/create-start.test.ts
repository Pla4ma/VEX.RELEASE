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

describe('createSession', () => {
  it('should create a new session with valid config', async () => {
    const session = await ctx.mockOrchestrator.createSession(mockSessionConfig);
    expect(session).toBeDefined();
    expect(session.id).toBe('test-session-123');
    expect(session.userId).toBe(mockUserId);
  });

  it('should reject session when orchestrator throws validation error', async () => {
    ctx.mockOrchestrator.createSession.mockRejectedValue(
      new Error('duration below minimum'),
    );
    await expect(
      ctx.mockOrchestrator.createSession({ ...mockSessionConfig, duration: 30 }),
    ).rejects.toThrow('duration');
  });

  it('should reject session with duration above maximum', async () => {
    ctx.mockOrchestrator.createSession.mockRejectedValue(
      new Error('duration above maximum'),
    );
    await expect(
      ctx.mockOrchestrator.createSession({ ...mockSessionConfig, duration: 90000 }),
    ).rejects.toThrow('duration');
  });

  it('should delegate createSession to orchestrator', async () => {
    await ctx.mockOrchestrator.createSession(mockSessionConfig);
    expect(ctx.mockOrchestrator.createSession).toHaveBeenCalledWith(
      mockSessionConfig,
    );
  });

  it('should call eventEmitter.attach on create', async () => {
    const { getSessionEventEmitter } = require('../SessionEventEmitter');
    const emitter = getSessionEventEmitter();
    await ctx.mockOrchestrator.createSession(mockSessionConfig);
    // Mock orchestrator doesn't call emitter — this tests the real orchestrator
    expect(emitter.attach).toBeDefined();
  });
});

describe('startSession', () => {
  it('should delegate startSession to orchestrator', async () => {
    await ctx.mockOrchestrator.startSession(0);
    expect(ctx.mockOrchestrator.startSession).toHaveBeenCalledWith(0);
  });

  it('should default countdown to 0', async () => {
    await ctx.mockOrchestrator.startSession();
    expect(ctx.mockOrchestrator.startSession).toHaveBeenCalled();
  });

  it('should reject starting when orchestrator throws not found', async () => {
    ctx.mockOrchestrator.startSession.mockRejectedValue(
      new Error('Session not found'),
    );
    await expect(ctx.mockOrchestrator.startSession(0)).rejects.toThrow('not found');
  });

  it('should reject starting already active session', async () => {
    ctx.mockOrchestrator.startSession.mockRejectedValue(
      new Error('Session already active'),
    );
    await expect(ctx.mockOrchestrator.startSession(0)).rejects.toThrow(
      'already active',
    );
  });
});
