import {
  createTestContext,
  mockSessionConfig,
  type TestContext,
} from "./helpers";
import { eventBus } from "../../events";

let ctx: TestContext;

beforeEach(() => {
  jest.clearAllMocks();
  ctx = createTestContext();
});

describe("createSession", () => {
  it("should create a new session with valid config", async () => {
    const session = await ctx.service.createSession(mockSessionConfig);
    expect(session).toBeDefined();
    expect(session.userId).toBe("test-user-123");
    expect(session.config.duration).toBe(mockSessionConfig.duration);
    expect(session.status).toBe("CREATED");
    expect(session.phase).toBe("PREPARATION");
  });

  it("should reject session with duration below minimum", async () => {
    const invalidConfig = { ...mockSessionConfig, duration: 30 };
    await expect(ctx.service.createSession(invalidConfig)).rejects.toThrow(
      "duration",
    );
  });

  it("should reject session with duration above maximum", async () => {
    const invalidConfig = { ...mockSessionConfig, duration: 90000 };
    await expect(ctx.service.createSession(invalidConfig)).rejects.toThrow(
      "duration",
    );
  });

  it("should emit session:created event", async () => {
    await ctx.service.createSession(mockSessionConfig);
    expect(eventBus.publish).toHaveBeenCalledWith(
      "session:created",
      expect.any(Object),
    );
  });

  it("should persist session to repository", async () => {
    const session = await ctx.service.createSession(mockSessionConfig);
    expect(ctx.mockRepository.saveSession).toHaveBeenCalledWith(session);
  });
});

describe("startSession", () => {
  it("should transition session from CREATED to ACTIVE", async () => {
    const session = await ctx.service.createSession(mockSessionConfig);
    const startedSession = await ctx.service.startSession(session.id);
    expect(startedSession.status).toBe("ACTIVE");
    expect(startedSession.phase).toBe("FOCUS");
    expect(startedSession.startedAt).toBeDefined();
  });

  it("should emit session:started event", async () => {
    const session = await ctx.service.createSession(mockSessionConfig);
    await ctx.service.startSession(session.id);
    expect(eventBus.publish).toHaveBeenCalledWith(
      "session:started",
      expect.any(Object),
    );
  });

  it("should reject starting non-existent session", async () => {
    await expect(ctx.service.startSession("non-existent-id")).rejects.toThrow(
      "not found",
    );
  });

  it("should reject starting already active session", async () => {
    const session = await ctx.service.createSession(mockSessionConfig);
    await ctx.service.startSession(session.id);
    await expect(ctx.service.startSession(session.id)).rejects.toThrow(
      "already active",
    );
  });
});
