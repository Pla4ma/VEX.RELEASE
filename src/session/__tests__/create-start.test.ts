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
    const session = await ctx.service.createCustomSession(mockSessionConfig);
    expect(session).toBeDefined();
    expect(session.id).toBe('test-session-123');
    expect(session.userId).toBe(mockUserId);
  });

  it('should reject session when orchestrator throws validation error', async () => {
    ctx.mockOrchestrator.createSession.mockRejectedValue(
      new Error('duration below minimum'),
    );
    await expect(
      ctx.service.createCustomSession({ ...mockSessionConfig, duration: 30 }),
    ).rejects.toThrow('duration');
  });

  it('should reject session with duration above maximum', async () => {
    ctx.mockOrchestrator.createSession.mockRejectedValue(
      new Error('duration above maximum'),
    );
    await expect(
      ctx.service.createCustomSession({ ...mockSessionConfig, duration: 90000 }),
    ).rejects.toThrow('duration');
  });

  it('should delegate createSession to orchestrator', async () => {
    await ctx.service.createCustomSession(mockSessionConfig);
    expect(ctx.mockOrchestrator.createSession).toHaveBeenCalledWith(
      mockSessionConfig,
    );
  });

  it('should call eventEmitter.attach on create', async () => {
    const { getSessionEventEmitter } = require('../SessionEventEmitter');
    const emitter = getSessionEventEmitter();
    await ctx.service.createCustomSession(mockSessionConfig);
    expect(emitter.attach).toHaveBeenCalledWith(
      'test-session-123',
      mockUserId,
    );
  });
});

describe('startSession', () => {
  it('should delegate startSession to orchestrator', async () => {
    await ctx.service.createCustomSession(mockSessionConfig);
    await ctx.service.startSession(0);
    expect(ctx.mockOrchestrator.startSession).toHaveBeenCalledWith(0);
  });

  it('should default countdown to 0', async () => {
    await ctx.service.createCustomSession(mockSessionConfig);
    await ctx.service.startSession();
    expect(ctx.mockOrchestrator.startSession).toHaveBeenCalledWith(0);
  });

  it('should reject starting when orchestrator throws not found', async () => {
    ctx.mockOrchestrator.startSession.mockRejectedValue(
      new Error('Session not found'),
    );
    await expect(ctx.service.startSession(0)).rejects.toThrow('not found');
  });

  it('should reject starting already active session', async () => {
    ctx.mockOrchestrator.startSession.mockRejectedValue(
      new Error('Session already active'),
    );
    await expect(ctx.service.startSession(0)).rejects.toThrow(
      'already active',
    );
  });
});
