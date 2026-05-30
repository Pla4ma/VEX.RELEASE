/**
 * Tests for Challenges — UserChallengeSchema, ChallengeTemplateSchema, ProgressHistoryEntrySchema
 */

import { describe, it, expect } from "@jest/globals";

import {
  UserChallengeSchema,
  ChallengeTemplateSchema,
  ProgressHistoryEntrySchema,
} from "../schemas";

const NOW = Date.now();

describe("Core Schemas", () => {
  describe("UserChallengeSchema", () => {
    it("parses camelCase user challenge", () => {
      const uc = UserChallengeSchema.parse({
        id: "uc-1",
        userId: "u-1",
        challengeId: "c-1",
        currentValue: 3,
        status: "ACTIVE",
        assignedAt: NOW,
      });
      expect(uc.userId).toBe("u-1");
      expect(uc.currentValue).toBe(3);
      expect(uc.status).toBe("ACTIVE");
    });

    it("normalises snake_case from Supabase", () => {
      const uc = UserChallengeSchema.parse({
        id: "uc-2",
        user_id: "u-2",
        challenge_id: "c-2",
        current_value: 5,
        status: "COMPLETED",
        assigned_at: NOW,
        completed_at: NOW,
        claimed_at: null,
        expires_at: null,
        reroll_count: 0,
        rerolled_from_id: null,
        last_progress_at: NOW,
        progress_history: [],
        created_at: NOW,
      });
      expect(uc.userId).toBe("u-2");
      expect(uc.challengeId).toBe("c-2");
      expect(uc.currentValue).toBe(5);
      expect(uc.completedAt).toBe(NOW);
    });

    it("applies defaults for missing fields", () => {
      const uc = UserChallengeSchema.parse({
        id: "uc-3",
        userId: "u-3",
        challengeId: "c-3",
      });
      expect(uc.currentValue).toBe(0);
      expect(uc.status).toBe("ACTIVE");
      expect(uc.rerollCount).toBe(0);
      expect(uc.progressHistory).toEqual([]);
    });

    it("rejects empty userId", () => {
      expect(() =>
        UserChallengeSchema.parse({ id: "uc", userId: "", challengeId: "c" }),
      ).toThrow();
    });
  });

  describe("ChallengeTemplateSchema", () => {
    it("parses a valid template with camelCase", () => {
      const tpl = ChallengeTemplateSchema.parse({
        id: "tpl-1",
        category: "SESSIONS",
        type: "DAILY",
        titleTemplate: "Complete {count} sessions",
        descriptionTemplate: "Do sessions",
        minTarget: 1,
        maxTarget: 5,
        minReward: 10,
        maxReward: 100,
        rewardType: "XP",
        weight: 1,
      });
      expect(tpl.id).toBe("tpl-1");
      expect(tpl.minTarget).toBe(1);
    });

    it("normalises snake_case template fields", () => {
      const tpl = ChallengeTemplateSchema.parse({
        id: "tpl-2",
        category: "MINUTES",
        type: "WEEKLY",
        title_template: "Focus {minutes} min",
        description_template: "Focus time",
        min_target: 30,
        max_target: 120,
        min_reward: 25,
        max_reward: 200,
        reward_type: "XP",
        weight: 2,
        min_level: 5,
        requires_premium: true,
        requires_squad: false,
      });
      expect(tpl.titleTemplate).toBe("Focus {minutes} min");
      expect(tpl.minTarget).toBe(30);
      expect(tpl.requiresPremium).toBe(true);
      expect(tpl.requiresSquad).toBe(false);
    });
  });

  describe("ProgressHistoryEntrySchema", () => {
    it("parses a valid entry", () => {
      const entry = ProgressHistoryEntrySchema.parse({
        timestamp: NOW,
        value: 5,
        source: "session",
        delta: 1,
      });
      expect(entry.delta).toBe(1);
    });

    it("rejects negative value", () => {
      expect(() =>
        ProgressHistoryEntrySchema.parse({ timestamp: 0, value: -1, source: "test", delta: 0 }),
      ).toThrow();
    });

    it("rejects empty source", () => {
      expect(() =>
        ProgressHistoryEntrySchema.parse({ timestamp: 0, value: 0, source: "", delta: 0 }),
      ).toThrow();
    });
  });
});
