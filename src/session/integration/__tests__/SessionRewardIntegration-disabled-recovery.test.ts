import { SessionRewardIntegration, eventBus } from './SessionRewardIntegration-disabled.helpers';

describe("SessionRewardIntegration recovery/abandonment gating", () => {
  const mockedEventBus = jest.mocked(eventBus);
  const helpers = jest.requireMock("../session-reward-helpers");

  beforeEach(() => {
    jest.clearAllMocks();
    mockedEventBus.subscribe.mockReturnValue(jest.fn());
  });

  it("should NOT publish XP for recovery when autoHandleRecoveryRewards is false (default)", async () => {
    new SessionRewardIntegration({});

    const recoveryHandler = mockedEventBus.subscribe.mock.calls.find(
      (call) => call[0] === "session:recovery:successful",
    )?.[1];

    await recoveryHandler?.({
      sessionId: "s1",
      userId: "u1",
      recoveredTime: 600,
    });

    expect(helpers.publishXp).not.toHaveBeenCalled();
  });

  it("should NOT publish XP for abandonment when autoHandleAbandonmentPartialCredit is false (default)", async () => {
    new SessionRewardIntegration({});

    const abandonHandler = mockedEventBus.subscribe.mock.calls.find(
      (call) => call[0] === "session:abandoned",
    )?.[1];

    await abandonHandler?.({ sessionId: "s1", userId: "u1", elapsedTime: 600 });

    expect(helpers.publishXp).not.toHaveBeenCalled();
  });

  it("should publish XP for recovery when autoHandleRecoveryRewards is true", async () => {
    new SessionRewardIntegration({ autoHandleRecoveryRewards: true });

    const recoveryHandler = mockedEventBus.subscribe.mock.calls.find(
      (call) => call[0] === "session:recovery:successful",
    )?.[1];

    await recoveryHandler?.({
      sessionId: "s1",
      userId: "u1",
      recoveredTime: 600,
    });

    expect(helpers.publishXp).toHaveBeenCalledWith(
      "u1",
      50,
      "session_recovery",
    );
  });

  it("should publish XP for abandonment when autoHandleAbandonmentPartialCredit is true and time >= 300s", async () => {
    new SessionRewardIntegration({ autoHandleAbandonmentPartialCredit: true });

    const abandonHandler = mockedEventBus.subscribe.mock.calls.find(
      (call) => call[0] === "session:abandoned",
    )?.[1];

    await abandonHandler?.({ sessionId: "s1", userId: "u1", elapsedTime: 600 });

    expect(helpers.publishXp).toHaveBeenCalledWith(
      "u1",
      30,
      "session_partial_abandon",
    );
  });

  it("should NOT publish XP for short abandonment (<300s) even when enabled", async () => {
    new SessionRewardIntegration({ autoHandleAbandonmentPartialCredit: true });

    const abandonHandler = mockedEventBus.subscribe.mock.calls.find(
      (call) => call[0] === "session:abandoned",
    )?.[1];

    await abandonHandler?.({ sessionId: "s1", userId: "u1", elapsedTime: 120 });

    expect(helpers.publishXp).not.toHaveBeenCalled();
  });
});
