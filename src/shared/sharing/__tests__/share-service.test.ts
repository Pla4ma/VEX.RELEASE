import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { Share } from "react-native";
import * as Sentry from "@sentry/react-native";
import { shareSession, shareAchievement, shareProfile } from "../share-service";
import type { SessionShareSummary } from "../types";

jest.mock("react-native", () => ({
  Share: { share: jest.fn(), dismissedAction: "dismissedAction" },
  Platform: { OS: "ios" },
}));

jest.mock("@sentry/react-native", () => ({
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
}));

jest.mock("../../../navigation/deep-link-utils", () => ({
  generateSessionShareLink: (id: string) => `https://vex.app/session/${id}`,
  generateProfileShareLink: (id: string) => `https://vex.app/profile/${id}`,
}));

const mockShare = jest.mocked(Share.share);
const mockCaptureException = jest.mocked(Sentry.captureException);
const mockBreadcrumb = jest.mocked(Sentry.addBreadcrumb);

const validSummary: SessionShareSummary = {
  sessionId: "sess-1",
  durationMinutes: 25,
  focusScore: 85,
  mode: "deep_work",
};

describe("shareSession", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockShare.mockResolvedValue({ action: "sharedAction" } as never);
  });

  it("returns success with correct url", async () => {
    const result = await shareSession("abc-123", validSummary);
    expect(result.success).toBe(true);
    expect(result.url).toBe("https://vex.app/session/abc-123");
  });

  it("includes session duration and score in message", async () => {
    await shareSession("abc-123", validSummary);
    expect(mockShare).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining("25min"),
      }),
    );
  });

  it("includes grade label based on focusScore", async () => {
    await shareSession("s1", { ...validSummary, focusScore: 92 });
    const call = mockShare.mock.calls[0] as [{ message: string }];
    expect(call[0].message).toContain("Grade S");

    mockShare.mockClear();
    mockShare.mockResolvedValue({ action: "sharedAction" } as never);
    await shareSession("s2", { ...validSummary, focusScore: 75 });
    const call2 = mockShare.mock.calls[0] as [{ message: string }];
    expect(call2[0].message).toContain("Grade A");
  });

  it("logs Sentry breadcrumb before sharing", async () => {
    await shareSession("abc", validSummary);
    expect(mockBreadcrumb).toHaveBeenCalledWith(
      expect.objectContaining({ category: "share.shareSession" }),
    );
  });

  it("returns error result when Share API throws", async () => {
    mockShare.mockRejectedValueOnce(new Error("cancelled"));
    const result = await shareSession("abc", validSummary);
    expect(result.success).toBe(false);
    expect(result.error).toBe("cancelled");
    expect(mockCaptureException).toHaveBeenCalled();
  });

  it("returns error result when user dismisses share dialog", async () => {
    mockShare.mockResolvedValue({ action: "dismissedAction" } as never);
    const result = await shareSession("abc", validSummary);
    expect(result.success).toBe(false);
    expect(result.error).toBe("Share dismissed by user");
  });
});

describe("shareAchievement", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockShare.mockResolvedValue({ action: "sharedAction" } as never);
  });

  it("returns success with achievement url", async () => {
    const result = await shareAchievement("ach-1", "First Focus");
    expect(result.success).toBe(true);
    expect(result.url).toBe("https://vex.app/achievement/ach-1");
    expect(result.error).toBeUndefined();
  });

  it("includes achievement name and trophy emoji in message", async () => {
    await shareAchievement("ach-1", "Speed Demon");
    const call = mockShare.mock.calls[0] as [{ message: string }];
    expect(call[0].message).toContain("Speed Demon");
    expect(call[0].message).toContain("🏆");
  });

  it("captures exception when Share API fails", async () => {
    mockShare.mockRejectedValueOnce(new Error("no permission"));
    const result = await shareAchievement("ach-1", "Test");
    expect(result.success).toBe(false);
    expect(mockCaptureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ tags: { component: "ShareService", operation: "shareAchievement" } }),
    );
  });
});

describe("shareProfile", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockShare.mockResolvedValue({ action: "sharedAction" } as never);
  });

  it("returns success with profile url", async () => {
    const result = await shareProfile("user-1");
    expect(result.success).toBe(true);
    expect(result.url).toBe("https://vex.app/profile/user-1");
  });

  it("logs Sentry breadcrumb", async () => {
    await shareProfile("user-1");
    expect(mockBreadcrumb).toHaveBeenCalledWith(
      expect.objectContaining({ category: "share.shareProfile" }),
    );
  });

  it("returns error result when Share API fails", async () => {
    mockShare.mockRejectedValueOnce(new Error("denied"));
    const result = await shareProfile("user-1");
    expect(result.success).toBe(false);
    expect(result.error).toBe("denied");
    expect(mockCaptureException).toHaveBeenCalled();
  });
});
