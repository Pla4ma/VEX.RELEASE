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

describe("pauseSession", () => {
  it("should pause active session", async () => {
    const session = await ctx.service.createSession(mockSessionConfig);
    await ctx.service.startSession(session.id);
    const pausedSession = await ctx.service.pauseSession(session.id, {
      reason: "USER_INITIATED",
    });
    expect(pausedSession.isPaused).toBe(true);
    expect(pausedSession.pauses).toBe(1);
    expect(pausedSession.pausedAt).toBeDefined();
  });

  it("should emit session:paused event", async () => {
    const session = await ctx.service.createSession(mockSessionConfig);
    await ctx.service.startSession(session.id);
    await ctx.service.pauseSession(session.id, { reason: "USER_INITIATED" });
    expect(eventBus.publish).toHaveBeenCalledWith(
      "session:paused",
      expect.any(Object),
    );
  });

  it("should track pause reason", async () => {
    const session = await ctx.service.createSession(mockSessionConfig);
    await ctx.service.startSession(session.id);
    await ctx.service.pauseSession(session.id, {
      reason: "INTERRUPTION",
      interruptionId: "int-123",
    });
    expect(eventBus.publish).toHaveBeenCalledWith(
      "session:paused",
      expect.objectContaining({
        reason: "INTERRUPTION",
        interruptionId: "int-123",
      }),
    );
  });
});

describe("resumeSession", () => {
  it("should resume paused session", async () => {
    const session = await ctx.service.createSession(mockSessionConfig);
    await ctx.service.startSession(session.id);
    await ctx.service.pauseSession(session.id, { reason: "USER_INITIATED" });
    const resumedSession = await ctx.service.resumeSession(session.id);
    expect(resumedSession.isPaused).toBe(false);
    expect(resumedSession.totalPausedTime).toBeGreaterThan(0);
  });

  it("should emit session:resumed event", async () => {
    const session = await ctx.service.createSession(mockSessionConfig);
    await ctx.service.startSession(session.id);
    await ctx.service.pauseSession(session.id, { reason: "USER_INITIATED" });
    await ctx.service.resumeSession(session.id);
    expect(eventBus.publish).toHaveBeenCalledWith(
      "session:resumed",
      expect.any(Object),
    );
  });
});
