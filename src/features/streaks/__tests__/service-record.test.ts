import { describe, it, expect, beforeEach, afterEach, jest } from "@jest/globals";
import { recordSession } from "../service";
import * as repository from "../repository";
import { mockStreak } from "./fixtures";

jest.mock("../repository");
jest.mock("../../../events", () => ({ eventBus: { publish: jest.fn() } }));

const USER_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const SESSION_ID = "b2c3d4e5-f6a7-8901-bcde-f12345678901";

describe("Streaks Service - Record Session", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set system time to noon UTC so 20h ago is always the previous calendar day
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2024-06-15T12:00:00Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should increment streak for qualifying session", async () => {
    const streak = mockStreak({
      currentDays: 3,
      longestDays: 5,
      lastQualifyingSessionAt: Date.now() - 20 * 60 * 60 * 1000,
      currentDayCompletedAt: null,
    });
    jest.mocked(repository.fetchStreak).mockResolvedValue(streak);
    jest.mocked(repository.updateStreak).mockResolvedValue(streak);
    const result = await recordSession({
      userId: USER_ID,
      sessionId: SESSION_ID,
      duration: 1200,
      qualityScore: 80,
      completedAt: Date.now(),
    });
    expect(result.action).toBe("INCREMENTED");
    expect(result.newStreak).toBe(4);
  });

  it("should break streak after 48 hours", async () => {
    const streak = mockStreak({
      currentDays: 5,
      longestDays: 10,
      lastQualifyingSessionAt: Date.now() - 72 * 60 * 60 * 1000,
      currentDayCompletedAt: null,
      shieldsAvailable: 0,
    });
    jest.mocked(repository.fetchStreak).mockResolvedValue(streak);
    jest.mocked(repository.updateStreak).mockResolvedValue(streak);
    const result = await recordSession({
      userId: USER_ID,
      sessionId: SESSION_ID,
      duration: 1200,
      qualityScore: 80,
      completedAt: Date.now(),
    });
    expect(result.action).toBe("BROKEN");
    expect(result.newStreak).toBe(1);
  });

  it("should break streak when shield available but window expired", async () => {
    const streak = mockStreak({
      currentDays: 5,
      longestDays: 10,
      lastQualifyingSessionAt: Date.now() - 50 * 60 * 60 * 1000,
      currentDayCompletedAt: null,
      shieldsAvailable: 1,
      gracePeriodUsed: false,
    });
    jest.mocked(repository.fetchStreak).mockResolvedValue(streak);
    jest.mocked(repository.getAvailableShield).mockResolvedValue("c3d4e5f6-a7b8-9012-cdef-123456789012");
    jest.mocked(repository.updateStreak).mockResolvedValue(streak);
    const result = await recordSession({
      userId: USER_ID,
      sessionId: SESSION_ID,
      duration: 1200,
      qualityScore: 80,
      completedAt: Date.now(),
    });
    expect(result.action).toBe("BROKEN");
  });

  it("should detect milestone on increment", async () => {
    const streak = mockStreak({
      currentDays: 6,
      longestDays: 10,
      lastQualifyingSessionAt: Date.now() - 20 * 60 * 60 * 1000,
      currentDayCompletedAt: null,
    });
    jest.mocked(repository.fetchStreak).mockResolvedValue(streak);
    jest.mocked(repository.updateStreak).mockResolvedValue(streak);
    const result = await recordSession({
      userId: USER_ID,
      sessionId: SESSION_ID,
      duration: 1200,
      qualityScore: 80,
      completedAt: Date.now(),
    });
    expect(result.milestoneReached).not.toBeNull();
    expect(result.milestoneReached?.days).toBe(7);
  });

  it("should reject non-qualifying session", async () => {
    const streak = mockStreak({
      currentDays: 3,
      longestDays: 5,
      lastQualifyingSessionAt: Date.now(),
      currentDayCompletedAt: Date.now(),
    });
    jest.mocked(repository.fetchStreak).mockResolvedValue(streak);
    const result = await recordSession({
      userId: USER_ID,
      sessionId: SESSION_ID,
      duration: 300,
      qualityScore: 80,
      completedAt: Date.now(),
    });
    expect(result.action).toBe("ALREADY_TODAY");
  });
});
