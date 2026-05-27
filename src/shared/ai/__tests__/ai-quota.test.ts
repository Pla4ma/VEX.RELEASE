import {
  checkQuota,
  consumeQuota,
  getRemainingQuota,
} from "../ai-quota-service";
import { clearUsage } from "../ai-quota-repository";
import type { AIRequestCategory } from "../ai-quota-types";
import { DEFAULT_QUOTA_STRATEGIES } from "../ai-quota-strategies";

const TEST_USER = "00000000-0000-0000-0000-000000000001";

describe("AI Quota Service", () => {
  afterEach(() => {
    clearUsage(TEST_USER, "coach_message");
    clearUsage(TEST_USER, "session_summary");
    clearUsage(TEST_USER, "weekly_reflection");
  });

  describe("checkQuota", () => {
    it("allows request when under hourly and daily limits", async () => {
      const result = await checkQuota(TEST_USER, "coach_message", "free");
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBeGreaterThan(0);
    });

    it("returns correct tier in result", async () => {
      const result = await checkQuota(TEST_USER, "coach_message", "paid");
      expect(result.tier).toBe("paid");
    });

    it("free tier has lower limits than paid", async () => {
      const freeResult = await checkQuota(TEST_USER, "coach_message", "free");
      const paidResult = await checkQuota(TEST_USER, "coach_message", "paid");
      expect(paidResult.limit).toBeGreaterThan(freeResult.limit);
    });

    it("internal tier has unlimited-like limits", async () => {
      const result = await checkQuota(TEST_USER, "coach_message", "internal");
      expect(result.allowed).toBe(true);
      expect(result.limit).toBeGreaterThanOrEqual(50);
    });

    it("free users cannot generate weekly reflections (hourly: 0)", async () => {
      const limits = DEFAULT_QUOTA_STRATEGIES.free.limits.weekly_reflection;
      expect(limits.hourly).toBe(0);
      const result = await checkQuota(TEST_USER, "weekly_reflection", "free");
      expect(result.allowed).toBe(false);
    });
  });

  describe("consumeQuota", () => {
    it("records usage and decrements remaining", async () => {
      clearUsage(TEST_USER, "coach_message");
      const before = getRemainingQuota(TEST_USER, "coach_message", "free");
      const beforeHourly = before.hourly;

      await consumeQuota(TEST_USER, "coach_message", 100);
      const after = getRemainingQuota(TEST_USER, "coach_message", "free");
      expect(after.hourly).toBeLessThan(beforeHourly);
    });

    it("blocks after exceeding hourly limit", async () => {
      clearUsage(TEST_USER, "coach_message");
      const limits = DEFAULT_QUOTA_STRATEGIES.free.limits.coach_message;
      for (let i = 0; i < limits.hourly; i += 1) {
        await consumeQuota(TEST_USER, "coach_message", 10);
      }
      const exceeded = await checkQuota(TEST_USER, "coach_message", "free");
      expect(exceeded.allowed).toBe(false);
      expect(exceeded.window).toBe("hourly");
    });
  });

  describe("getRemainingQuota", () => {
    it("returns remaining for all windows", () => {
      const remaining = getRemainingQuota(TEST_USER, "coach_message", "free");
      expect(remaining).toHaveProperty("hourly");
      expect(remaining).toHaveProperty("daily");
      expect(remaining).toHaveProperty("tokenBudget");
      expect(remaining.hourly).toBeGreaterThanOrEqual(0);
    });
  });

  describe("category-specific limits", () => {
    it("coach_message has different limits than session_summary", () => {
      const coach = DEFAULT_QUOTA_STRATEGIES.free.limits.coach_message;
      const summary = DEFAULT_QUOTA_STRATEGIES.free.limits.session_summary;
      expect(coach.hourly).not.toBe(summary.hourly);
    });

    it("content_study_generation has high token budget", () => {
      const cs = DEFAULT_QUOTA_STRATEGIES.free.limits.content_study_generation;
      expect(cs.tokenBudget).toBeGreaterThan(10_000);
    });

    it("all categories have defined limits for free tier", () => {
      const categories: AIRequestCategory[] = [
        "coach_message",
        "session_summary",
        "comeback_prompt",
        "streak_nudge",
        "weekly_reflection",
        "content_study_generation",
        "quiz_generation",
      ];
      for (const cat of categories) {
        expect(DEFAULT_QUOTA_STRATEGIES.free.limits[cat]).toBeDefined();
      }
    });
  });

  describe("token budget tracking", () => {
    it("tracks total tokens consumed across requests", async () => {
      clearUsage(TEST_USER, "coach_message");
      await consumeQuota(TEST_USER, "coach_message", 500);
      await consumeQuota(TEST_USER, "coach_message", 500);
      const remaining = getRemainingQuota(TEST_USER, "coach_message", "free");
      expect(remaining.tokenBudget).toBeLessThan(
        DEFAULT_QUOTA_STRATEGIES.free.limits.coach_message.tokenBudget,
      );
    });
  });
});
