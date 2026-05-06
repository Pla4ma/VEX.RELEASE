/**
 * Comeback Service Tests
 *
 * Tests for user re-engagement logic.
 */

import { describe, it, expect, beforeEach, jest, afterEach } from "@jest/globals";
import { generateComebackQuest, qualifiesForComeback, getComebackMessage, createComebackNotification, calculateReEngagementProbability, saveComebackQuest, getActiveComebackQuest, completeComebackQuest, ComebackQuestSchema, type ComebackContext, type ComebackQuest } from "../comeback-service";

const BASE_CONTEXT: ComebackContext = {
  daysSinceLastSession: 2,
  previousStreak: 0,
  streakBroken: false,
  wasInvitedBack: false,
};

describe("generateComebackQuest", () => {
  const userId = "user-test-1";

  it("returns a streak_restore quest when streak was broken and previous streak > 3", () => {
    const context: ComebackContext = {
      daysSinceLastSession: 2,
      previousStreak: 5,
      streakBroken: true,
      wasInvitedBack: false,
    };
    const quest = generateComebackQuest(userId, context);
    expect(quest.type).toBe("streak_restore");
    expect(quest.reward.streakRestored).toBe(true);
    expect(quest.description).toContain("5");
  });

  it("returns a mini_session quest when gone more than 7 days (takes priority over social)", () => {
    const context: ComebackContext = {
      daysSinceLastSession: 10,
      previousStreak: 0,
      streakBroken: false,
      wasInvitedBack: true,
      inviterName: "Alice",
    };
    const quest = generateComebackQuest(userId, context);
    expect(quest.type).toBe("mini_session");
    expect(quest.reward.streakRestored).toBe(false);
  });

  it("returns a social_reconnect quest when invited back", () => {
    const context: ComebackContext = {
      daysSinceLastSession: 2,
      previousStreak: 0,
      streakBroken: false,
      wasInvitedBack: true,
      inviterName: "Bob",
    };
    const quest = generateComebackQuest(userId, context);
    expect(quest.type).toBe("social_reconnect");
    expect(quest.title).toContain("Bob");
  });

  it("returns a boss_fight quest as the default fallback", () => {
    const quest = generateComebackQuest(userId, BASE_CONTEXT);
    expect(quest.type).toBe("boss_fight");
  });

  it("creates a quest with a valid schema", () => {
    const quest = generateComebackQuest(userId, BASE_CONTEXT);
    expect(() => ComebackQuestSchema.parse(quest)).not.toThrow();
  });

  it("sets quest status to active", () => {
    const quest = generateComebackQuest(userId, BASE_CONTEXT);
    expect(quest.status).toBe("active");
  });

  it("sets expiresAt approximately 48 hours from now", () => {
    const before = Date.now();
    const quest = generateComebackQuest(userId, BASE_CONTEXT);
    const after = Date.now();
    const expected48h = 48 * 60 * 60 * 1000;
    expect(quest.expiresAt - quest.createdAt).toBeGreaterThanOrEqual(expected48h - 100);
    expect(quest.expiresAt - quest.createdAt).toBeLessThanOrEqual(expected48h + 100);
  });

  it("sets userId correctly", () => {
    const quest = generateComebackQuest(userId, BASE_CONTEXT);
    expect(quest.userId).toBe(userId);
  });

  it("streak_restore quest is NOT returned when streak <= 3", () => {
    const context: ComebackContext = {
      daysSinceLastSession: 2,
      previousStreak: 3,
      streakBroken: true,
      wasInvitedBack: false,
    };
    const quest = generateComebackQuest(userId, context);
    expect(quest.type).not.toBe("streak_restore");
  });
});

describe("qualifiesForComeback", () => {
  it("returns true when gone 3+ days regardless of streak", () => {
    expect(qualifiesForComeback(3, 5)).toBe(true);
  });

  it("returns true when streak is 0 and gone 1 day", () => {
    expect(qualifiesForComeback(1, 0)).toBe(true);
  });

  it("returns true when gone 7+ days regardless", () => {
    expect(qualifiesForComeback(7, 10)).toBe(true);
  });

  it("returns false when gone 2 days with active streak", () => {
    expect(qualifiesForComeback(2, 5)).toBe(false);
  });

  it("returns false when gone 0 days", () => {
    expect(qualifiesForComeback(0, 5)).toBe(false);
  });
});

describe("getComebackMessage", () => {
  it("returns 1-day message for daysSinceLastSession === 1", () => {
    expect(getComebackMessage(1, 0)).toBe("One day off is healthy. Ready to continue?");
  });

  it("returns 3-day routine message for 2-3 days", () => {
    expect(getComebackMessage(2, 0)).toBe("Your routine is waiting for you.");
    expect(getComebackMessage(3, 0)).toBe("Your routine is waiting for you.");
  });

  it("returns streak reminder when previous streak > 7 and many days away", () => {
    const msg = getComebackMessage(10, 10);
    expect(msg).toContain("10 days");
  });

  it("returns generic message as default", () => {
    expect(getComebackMessage(10, 3)).toBe("Every expert was once a beginner. Start again.");
  });
});

describe("createComebackNotification", () => {
  const baseQuest: ComebackQuest = {
    id: "quest-1",
    userId: "user-1",
    type: "streak_restore",
    title: "Win Back Your Streak",
    description: "Complete a session.",
    reward: { xp: 50, coins: 100, streakRestored: true },
    status: "active",
    expiresAt: Date.now() + 48 * 3600 * 1000,
    completedAt: null,
    createdAt: Date.now(),
  };

  it("creates notification for streak_restore", () => {
    const notif = createComebackNotification({ ...baseQuest, type: "streak_restore" });
    expect(notif.actionType).toBe("streak_restore");
    expect(notif.title).toBe("Win Back Your Streak");
  });

  it("creates notification for mini_session", () => {
    const quest = { ...baseQuest, type: "mini_session" as const };
    const notif = createComebackNotification(quest);
    expect(notif.actionType).toBe("mini_session");
    expect(notif.title).toBe("Welcome Back");
  });

  it("creates notification for social_reconnect", () => {
    const quest = { ...baseQuest, type: "social_reconnect" as const };
    const notif = createComebackNotification(quest);
    expect(notif.actionType).toBe("social_reconnect");
  });

  it("creates notification for boss_fight", () => {
    const quest = { ...baseQuest, type: "boss_fight" as const };
    const notif = createComebackNotification(quest);
    expect(notif.actionType).toBe("boss_fight");
  });
});

describe("calculateReEngagementProbability", () => {
  it("starts at base probability of 0.7", () => {
    expect(calculateReEngagementProbability(0, 0, 0)).toBeCloseTo(0.7);
  });

  it("decreases with more days away", () => {
    const base = calculateReEngagementProbability(0, 0, 0);
    const sevenDays = calculateReEngagementProbability(8, 0, 0);
    expect(sevenDays).toBeLessThan(base);
  });

  it("decreases further after 14 days", () => {
    const sevenDays = calculateReEngagementProbability(8, 0, 0);
    const fourteenDays = calculateReEngagementProbability(15, 0, 0);
    expect(fourteenDays).toBeLessThan(sevenDays);
  });

  it("increases with more previous sessions (> 10)", () => {
    const few = calculateReEngagementProbability(0, 5, 0);
    const many = calculateReEngagementProbability(0, 11, 0);
    expect(many).toBeGreaterThan(few);
  });

  it("increases with more previous sessions (> 50)", () => {
    const eleven = calculateReEngagementProbability(0, 11, 0);
    const fiftyOne = calculateReEngagementProbability(0, 51, 0);
    expect(fiftyOne).toBeGreaterThan(eleven);
  });

  it("increases with high session quality", () => {
    const low = calculateReEngagementProbability(0, 0, 50);
    const high = calculateReEngagementProbability(0, 0, 85);
    expect(high).toBeGreaterThan(low);
  });

  it("clamps to 1.0 max", () => {
    expect(calculateReEngagementProbability(0, 100, 100)).toBeLessThanOrEqual(1);
  });

  it("clamps to 0.0 min", () => {
    expect(calculateReEngagementProbability(365, 0, 0)).toBeGreaterThanOrEqual(0);
  });
});

let _userIdCounter = 0;
const uniqueUserId = (prefix: string) => `${prefix}-${++_userIdCounter}`;

describe("saveComebackQuest / getActiveComebackQuest", () => {
  const userId = uniqueUserId("comeback-user");

  it("returns null when no quest saved", async () => {
    const result = await getActiveComebackQuest(uniqueUserId("no-such-user"));
    expect(result).toBeNull();
  });

  it("saves and retrieves an active quest", async () => {
    const quest = generateComebackQuest(userId, BASE_CONTEXT);
    await saveComebackQuest(quest);
    const retrieved = await getActiveComebackQuest(userId);
    expect(retrieved?.id).toBe(quest.id);
    expect(retrieved?.status).toBe("active");
  });

  it("marks quest as expired when expiresAt is in the past", async () => {
    const userId2 = uniqueUserId("expired-quest-user");
    const quest: ComebackQuest = {
      ...generateComebackQuest(userId2, BASE_CONTEXT),
      expiresAt: Date.now() - 1000, // already expired
    };
    await saveComebackQuest(quest);
    const retrieved = await getActiveComebackQuest(userId2);
    expect(retrieved?.status).toBe("expired");
  });
});

describe("completeComebackQuest", () => {
  it("completes an active quest", async () => {
    const userId = uniqueUserId("complete-user");
    const quest = generateComebackQuest(userId, BASE_CONTEXT);
    await saveComebackQuest(quest);

    const completed = await completeComebackQuest(userId, quest.id);
    expect(completed?.status).toBe("completed");
    expect(completed?.completedAt).not.toBeNull();
  });

  it("returns null when quest id does not match", async () => {
    const userId = uniqueUserId("no-match-user");
    const quest = generateComebackQuest(userId, BASE_CONTEXT);
    await saveComebackQuest(quest);

    const result = await completeComebackQuest(userId, "wrong-id");
    expect(result).toBeNull();
  });

  it("returns null when no quest exists for user", async () => {
    const result = await completeComebackQuest(uniqueUserId("ghost-user"), "any-id");
    expect(result).toBeNull();
  });
});
