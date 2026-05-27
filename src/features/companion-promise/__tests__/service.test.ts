import {
  dismissRecovery,
  getHomePromiseState,
  keepPromise,
  processCompletedSessionPromise,
} from "../service";

jest.mock("../repository", () => ({
  createPromise: jest.fn(),
  dismissRecoveryPromise: jest.fn(),
  fulfillPromise: jest.fn(),
  getPendingPromise: jest.fn(),
  getRecentPromises: jest.fn(),
  markPromiseMissed: jest.fn(),
  replacePromise: jest.fn(),
}));
jest.mock("../analytics", () => ({
  trackPromiseCreated: jest.fn(),
  trackPromiseFulfilled: jest.fn(),
  trackPromiseMissed: jest.fn(),
  trackPromiseRecovered: jest.fn(),
}));
jest.mock("../events", () => ({
  publishPromiseCreated: jest.fn(),
  publishPromiseFulfilled: jest.fn(),
  publishPromiseMissed: jest.fn(),
  publishPromiseRecovered: jest.fn(),
}));

const repository = jest.requireMock("../repository") as Record<
  string,
  jest.Mock
>;
const basePromise = {
  createdAt: "2026-05-20T10:00:00.000Z",
  fulfilledAt: null,
  id: "550e8400-e29b-41d4-a716-446655440001",
  missedAt: null,
  sourceSessionId: "550e8400-e29b-41d4-a716-446655440002",
  status: "pending" as const,
  targetDate: "2026-05-21",
  targetDurationMinutes: 25,
  targetMode: "FOCUS" as const,
  userId: "user-123",
};

describe("companion promise service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    repository.createPromise.mockResolvedValue(basePromise);
    repository.dismissRecoveryPromise.mockResolvedValue({
      ...basePromise,
      status: "replaced",
    });
    repository.getPendingPromise.mockResolvedValue(null);
    repository.getRecentPromises.mockResolvedValue([]);
    repository.markPromiseMissed.mockResolvedValue({
      ...basePromise,
      status: "missed",
      missedAt: "2026-05-22T10:00:00.000Z",
    });
    repository.replacePromise.mockResolvedValue({
      ...basePromise,
      status: "replaced",
    });
    repository.fulfillPromise.mockResolvedValue({
      ...basePromise,
      status: "fulfilled",
      fulfilledAt: "2026-05-21T12:00:00.000Z",
    });
  });

  it("creates a promise for a qualifying session and skips short sessions", async () => {
    const created = await processCompletedSessionPromise(
      {
        completedAt: Date.parse("2026-05-20T10:00:00.000Z"),
        durationMinutes: 25,
        sessionId: basePromise.sourceSessionId,
        sessionMode: "FLOW",
        userId: basePromise.userId,
      },
      "America/New_York",
    );
    expect(created.createdPromise?.targetMode).toBe("FOCUS");

    const skipped = await processCompletedSessionPromise(
      {
        completedAt: Date.parse("2026-05-20T10:00:00.000Z"),
        durationMinutes: 4,
        sessionId: basePromise.sourceSessionId,
        sessionMode: "FLOW",
        userId: basePromise.userId,
      },
      "America/New_York",
    );
    expect(skipped.createdPromise).toBeNull();
  });

  it("replaces an older pending promise, fulfills a matching target-day promise, and marks overdue as missed", async () => {
    repository.getPendingPromise
      .mockResolvedValueOnce(basePromise)
      .mockResolvedValueOnce(basePromise);
    await processCompletedSessionPromise(
      {
        completedAt: Date.parse("2026-05-20T11:00:00.000Z"),
        durationMinutes: 30,
        sessionId: "550e8400-e29b-41d4-a716-446655440099",
        sessionMode: "FLOW",
        userId: basePromise.userId,
      },
      "America/New_York",
    );
    expect(repository.replacePromise).toHaveBeenCalledWith(basePromise.id);

    repository.getPendingPromise
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(basePromise)
      .mockResolvedValueOnce(basePromise);
    const fulfilled = await processCompletedSessionPromise(
      {
        completedAt: Date.parse("2026-05-21T14:00:00.000Z"),
        durationMinutes: 30,
        sessionId: "550e8400-e29b-41d4-a716-446655440098",
        sessionMode: "FLOW",
        userId: basePromise.userId,
      },
      "America/New_York",
    );
    expect(fulfilled.fulfilledPromise?.status).toBe("fulfilled");

    repository.getPendingPromise.mockReset();
    repository.getPendingPromise.mockResolvedValue({
      ...basePromise,
      targetDate: "2026-05-20",
    });
    await getHomePromiseState(
      basePromise.userId,
      true,
      "America/New_York",
      Date.parse("2026-05-21T05:00:00.000Z"),
    );
    expect(repository.markPromiseMissed).toHaveBeenCalledWith(
      basePromise.id,
      expect.any(String),
    );
  });

  it("handles timezone boundaries, offline home state, and recovery actions", async () => {
    const boundary = await processCompletedSessionPromise(
      {
        completedAt: Date.parse("2026-05-21T05:30:00.000Z"),
        durationMinutes: 30,
        sessionId: "550e8400-e29b-41d4-a716-446655440097",
        sessionMode: "FLOW",
        userId: basePromise.userId,
      },
      "America/New_York",
    );
    expect(boundary.createdPromise?.status).toBe("pending");
    expect(repository.createPromise).toHaveBeenCalledWith(
      expect.objectContaining({ targetDate: "2026-05-22" }),
    );

    repository.getPendingPromise.mockResolvedValueOnce(basePromise);
    const offline = await getHomePromiseState(
      basePromise.userId,
      false,
      "America/New_York",
      Date.parse("2026-05-20T12:00:00.000Z"),
    );
    expect(offline).toMatchObject({ kind: "pending", showOfflineBanner: true });

    await keepPromise({ ...basePromise, status: "missed" });
    await dismissRecovery(basePromise.id);
    expect(repository.dismissRecoveryPromise).toHaveBeenCalledTimes(2);
  });
});
