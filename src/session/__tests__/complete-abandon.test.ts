import {
  createTestContext,
  mockSessionConfig,
  type TestContext,
} from "./helpers";
import { eventBus } from "../../events";
import { SESSION_CONSTANTS } from "../index";

let ctx: TestContext;

beforeEach(() => {
  jest.clearAllMocks();
  ctx = createTestContext();
});

describe("completeSession", () => {
  it("should complete session and calculate rewards", async () => {
    const session = await ctx.service.createCustomSession(mockSessionConfig);
    await ctx.service.startSession(session.id);
    jest.advanceTimersByTime(1000);
    const completedSession = await ctx.service.completeSession(session.id, {
      completionPercentage: 100,
      focusQuality: 85,
    });
    expect(completedSession.status).toBe("COMPLETED");
    expect(completedSession.completedAt).toBeDefined();
    expect(completedSession.summary).toBeDefined();
    expect(completedSession.summary?.xpEarned).toBeGreaterThan(0);
  });

  it("should emit session:completed event", async () => {
    const session = await ctx.service.createCustomSession(mockSessionConfig);
    await ctx.service.startSession(session.id);
    await ctx.service.completeSession(session.id, {
      completionPercentage: 100,
    });
    expect(eventBus.publish).toHaveBeenCalledWith(
      "session:completed",
      expect.any(Object),
    );
  });

  it("should emit session:rewards:granted event", async () => {
    const session = await ctx.service.createCustomSession(mockSessionConfig);
    await ctx.service.startSession(session.id);
    await ctx.service.completeSession(session.id, {
      completionPercentage: 100,
    });
    expect(eventBus.publish).toHaveBeenCalledWith(
      "session:rewards:granted",
      expect.any(Object),
    );
  });

  it("should handle partial completion", async () => {
    const session = await ctx.service.createCustomSession(mockSessionConfig);
    await ctx.service.startSession(session.id);
    const completedSession = await ctx.service.completeSession(session.id, {
      completionPercentage: 50,
      focusQuality: 60,
    });
    expect(completedSession.summary?.completionPercentage).toBe(50);
    expect(completedSession.summary?.xpEarned).toBeLessThan(
      SESSION_CONSTANTS.BASE_SCORE_PER_MINUTE * 30,
    );
  });
});

describe("abandonSession", () => {
  it("should mark session as abandoned", async () => {
    const session = await ctx.service.createCustomSession(mockSessionConfig);
    await ctx.service.startSession(session.id);
    const abandonedSession = await ctx.service.abandonSession(
      session.id,
      "USER_CANCELLED",
    );
    expect(abandonedSession.status).toBe("ABANDONED");
    expect(abandonedSession.abandonedAt).toBeDefined();
    expect(abandonedSession.abandonReason).toBe("USER_CANCELLED");
  });

  it("should emit session:abandoned event", async () => {
    const session = await ctx.service.createCustomSession(mockSessionConfig);
    await ctx.service.startSession(session.id);
    await ctx.service.abandonSession(session.id, "USER_CANCELLED");
    expect(eventBus.publish).toHaveBeenCalledWith(
      "session:abandoned",
      expect.objectContaining({ reason: "USER_CANCELLED" }),
    );
  });

  it("should not grant rewards for abandoned session", async () => {
    const session = await ctx.service.createCustomSession(mockSessionConfig);
    await ctx.service.startSession(session.id);
    await ctx.service.abandonSession(session.id, "USER_CANCELLED");
    const rewardsCall = (eventBus.publish as jest.Mock).mock.calls.find(
      (call) => call[0] === "session:rewards:granted",
    );
    expect(rewardsCall).toBeUndefined();
  });
});
