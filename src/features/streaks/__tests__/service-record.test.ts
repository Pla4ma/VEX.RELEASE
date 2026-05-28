import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { recordSession } from "../service";
import * as repository from "../repository";
import { mockStreak } from "./fixtures";

jest.mock("../repository");
jest.mock("../../../events", () => ({ eventBus: { publish: jest.fn() } }));

describe("Streaks Service - Record Session", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
      userId: "user-1",
      sessionId: "session-1",
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
      userId: "user-1",
      sessionId: "session-1",
      duration: 1200,
      qualityScore: 80,
      completedAt: Date.now(),
    });
    expect(result.action).toBe("BROKEN");
    expect(result.newStreak).toBe(1);
  });

  it("should use shield when available", async () => {
    const streak = mockStreak({
      currentDays: 5,
      longestDays: 10,
      lastQualifyingSessionAt: Date.now() - 36 * 60 * 60 * 1000,
      currentDayCompletedAt: null,
      shieldsAvailable: 1,
    });
    jest.mocked(repository.fetchStreak).mockResolvedValue(streak);
    jest.mocked(repository.getAvailableShield).mockResolvedValue("shield-1");
    jest.mocked(repository.updateStreak).mockResolvedValue(streak);
    const result = await recordSession({
      userId: "user-1",
      sessionId: "session-1",
      duration: 1200,
      qualityScore: 80,
      completedAt: Date.now(),
    });
    expect(result.action).toBe("SHIELD_PROTECTED");
    expect(result.shieldUsed).toBe(true);
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
      userId: "user-1",
      sessionId: "session-1",
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
      userId: "user-1",
      sessionId: "session-1",
      duration: 600,
      qualityScore: 80,
      completedAt: Date.now(),
    });
    expect(result.action).toBe("ALREADY_TODAY");
  });
});
