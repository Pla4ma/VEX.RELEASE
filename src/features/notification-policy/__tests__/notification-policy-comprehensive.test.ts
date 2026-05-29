import { decideNudge } from "../service";
import { NudgeDecisionSchema, NudgePolicyInputSchema, NudgeSignalRecordSchema } from "../schemas";
import { laneToCategory, copyFor } from "../nudge-copy";
import {
  buildRescueDeepLink,
  isRescueDeepLinkValid,
  markExpiredAsIgnored,
} from "../nudge-deep-link";
import { checkNotificationBudget } from "../notification-policy-bridge";

describe("notification policy — comprehensive", () => {
  describe("decideNudge — budget rules", () => {
    it("blocks unsolicited Day 0 nudges", () => {
      const decision = decideNudge({
        lane: "student",
        completedSessions: 0,
        daysSinceOnboarding: 0,
      });
      expect(decision.allowed).toBe(false);
      expect(decision.reason).toContain("Day 0");
    });

    it("enforces minimal lane max 1/day", () => {
      const atLimit = decideNudge({
        lane: "minimal_normal",
        completedSessions: 3,
        daysSinceOnboarding: 2,
        sentToday: 1,
      });
      expect(atLimit.allowed).toBe(false);
      expect(atLimit.budgetRemaining).toBe(0);

      const underLimit = decideNudge({
        lane: "minimal_normal",
        completedSessions: 3,
        daysSinceOnboarding: 2,
        sentToday: 0,
      });
      expect(underLimit.allowed).toBe(true);
      expect(underLimit.budgetRemaining).toBe(1);
    });

    it("enforces non-minimal lane max 2/day", () => {
      const atLimit = decideNudge({
        lane: "student",
        completedSessions: 3,
        daysSinceOnboarding: 2,
        sentToday: 2,
      });
      expect(atLimit.allowed).toBe(false);
      expect(atLimit.budgetRemaining).toBe(0);

      const underLimit = decideNudge({
        lane: "game_like",
        completedSessions: 4,
        daysSinceOnboarding: 3,
        sentToday: 1,
      });
      expect(underLimit.allowed).toBe(true);
      expect(underLimit.budgetRemaining).toBe(1);
    });

    it("blocks all nudges when user is muted", () => {
      const blocked = decideNudge({
        lane: "student",
        completedSessions: 10,
        daysSinceOnboarding: 30,
        userMuted: true,
      });
      expect(blocked.allowed).toBe(false);
      expect(blocked.reason).toContain("User mute");
    });

    it("blocks during quiet hours", () => {
      const blocked = decideNudge({
        lane: "game_like",
        completedSessions: 4,
        daysSinceOnboarding: 3,
        quietHoursActive: true,
      });
      expect(blocked.allowed).toBe(false);
      expect(blocked.reason).toContain("Quiet hours");
    });

    it("blocks when recent dismissals >= 3 (category paused)", () => {
      const paused = decideNudge({
        lane: "student",
        completedSessions: 5,
        daysSinceOnboarding: 7,
        recentDismissals: 3,
      });
      expect(paused.allowed).toBe(false);
      expect(paused.reason).toContain("category paused");
    });

    it("suppresses low-trust nudges at 2 dismissals but allows rescue", () => {
      const blocked = decideNudge({
        lane: "deep_creative",
        completedSessions: 4,
        daysSinceOnboarding: 3,
        recentDismissals: 2,
      });
      expect(blocked.allowed).toBe(false);
      expect(blocked.reason).toContain("suppress");

      const rescue = decideNudge({
        lane: "deep_creative",
        completedSessions: 4,
        daysSinceOnboarding: 3,
        recentDismissals: 2,
        context: "avoidance",
      });
      expect(rescue.allowed).toBe(true);
      expect(rescue.type).toBe("rescue");
    });
  });

  describe("decideNudge — context routing", () => {
    it("routes avoidance context to rescue type", () => {
      const result = decideNudge({
        lane: "minimal_normal",
        completedSessions: 2,
        daysSinceOnboarding: 2,
        context: "avoidance",
      });
      expect(result.type).toBe("rescue");
      expect(result.allowed).toBe(true);
      expect(result.priority).toBe("high");
    });

    it("routes deadline context + student lane to study_deadline", () => {
      const result = decideNudge({
        lane: "student",
        completedSessions: 2,
        daysSinceOnboarding: 2,
        context: "deadline",
      });
      expect(result.type).toBe("study_deadline");
      expect(result.priority).toBe("high");
    });

    it("routes project_stale + deep_creative to project_resume", () => {
      const result = decideNudge({
        lane: "deep_creative",
        completedSessions: 4,
        daysSinceOnboarding: 3,
        context: "project_stale",
      });
      expect(result.type).toBe("project_resume");
    });

    it("routes run_open + game_like to run_continue", () => {
      const result = decideNudge({
        lane: "game_like",
        completedSessions: 5,
        daysSinceOnboarding: 4,
        context: "run_open",
      });
      expect(result.type).toBe("run_continue");
    });

    it("routes weekly_ready context to weekly_insight", () => {
      const result = decideNudge({
        lane: "student",
        completedSessions: 3,
        daysSinceOnboarding: 5,
        context: "weekly_ready",
      });
      expect(result.type).toBe("weekly_insight");
    });

    it("returns gentle_return when user has completed sessions and no special context", () => {
      const result = decideNudge({
        lane: "student",
        completedSessions: 2,
        daysSinceOnboarding: 2,
      });
      expect(result.type).toBe("gentle_return");
      expect(result.allowed).toBe(true);
    });

    it("returns none when no sessions completed and no context", () => {
      const result = decideNudge({
        lane: "student",
        completedSessions: 0,
        daysSinceOnboarding: 2,
      });
      expect(result.allowed).toBe(false);
    });
  });

  describe("decideNudge — copy generation", () => {
    it("produces student-specific rescue copy", () => {
      const result = decideNudge({
        lane: "student",
        completedSessions: 2,
        daysSinceOnboarding: 2,
        context: "avoidance",
      });
      expect(result.title).toBe("Need a tiny start?");
      expect(result.body).toContain("weak section");
    });

    it("produces game_like rescue copy", () => {
      const result = decideNudge({
        lane: "game_like",
        completedSessions: 4,
        daysSinceOnboarding: 3,
        context: "avoidance",
      });
      expect(result.title).toBe("Need a recovery encounter?");
    });

    it("produces study_deadline copy", () => {
      const result = decideNudge({
        lane: "student",
        completedSessions: 2,
        daysSinceOnboarding: 2,
        context: "deadline",
      });
      expect(result.body).toBe(
        "Your next study block fits: 15 minutes on one topic.",
      );
    });

    it("produces gentle_return copy per lane", () => {
      const student = decideNudge({
        lane: "student",
        completedSessions: 2,
        daysSinceOnboarding: 2,
      });
      expect(student.body).toContain("focused study block");

      const minimal = decideNudge({
        lane: "minimal_normal",
        completedSessions: 1,
        daysSinceOnboarding: 1,
      });
      expect(minimal.body).toBe("One clean block is enough today.");
    });
  });

  describe("decideNudge — schema compliance", () => {
    it("all decisions pass NudgeDecisionSchema", () => {
      const inputs = [
        { lane: "student" as const, completedSessions: 0, daysSinceOnboarding: 0 },
        { lane: "minimal_normal" as const, completedSessions: 3, daysSinceOnboarding: 2, sentToday: 1 },
        { lane: "game_like" as const, completedSessions: 4, daysSinceOnboarding: 3, context: "avoidance" as const },
        { lane: "deep_creative" as const, completedSessions: 5, daysSinceOnboarding: 7, userMuted: true },
      ];

      for (const input of inputs) {
        const decision = decideNudge(input);
        expect(() => NudgeDecisionSchema.parse(decision)).not.toThrow();
      }
    });
  });

  describe("nudge-deep-link", () => {
    it("builds valid rescue deep link", () => {
      const link = buildRescueDeepLink("plan-1", "Review notes", 600);
      expect(link.type).toBe("start_rescue");
      expect(link.payload.rescuePlanId).toBe("plan-1");
      expect(link.payload.rescueTaskDescription).toBe("Review notes");
      expect(link.payload.suggestedDurationSeconds).toBe(600);
      expect(link.payload.source).toBe("rescue");
    });

    it("validates correct rescue deep link", () => {
      const link = buildRescueDeepLink("plan-2", "Do 5 min", 300);
      expect(isRescueDeepLinkValid(link)).toBe(true);
    });

    it("rejects null deep link", () => {
      expect(isRescueDeepLinkValid(null)).toBe(false);
    });

    it("rejects undefined deep link", () => {
      expect(isRescueDeepLinkValid(undefined)).toBe(false);
    });

    it("rejects empty object deep link", () => {
      expect(isRescueDeepLinkValid({})).toBe(false);
    });

    it("rejects wrong type deep link", () => {
      expect(isRescueDeepLinkValid({ type: "wrong" })).toBe(false);
    });

    it("rejects deep link without payload", () => {
      expect(isRescueDeepLinkValid({ type: "start_rescue" })).toBe(false);
    });

    it("marks expired sent record as ignored after 30 min", () => {
      const result = markExpiredAsIgnored(
        "user-1",
        "student",
        Date.now() - 31 * 60 * 1000,
      );
      expect(result).toHaveLength(1);
      expect(result[0]!.signal).toBe("ignored");
      expect(result[0]!.userId).toBe("user-1");
      expect(result[0]!.lane).toBe("student");
    });

    it("does not mark recent sent record as ignored", () => {
      const result = markExpiredAsIgnored("user-2", "game_like", Date.now());
      expect(result).toHaveLength(0);
    });

    it("marks expired signals from record array as ignored", () => {
      const now = Date.now();
      const records = [
        {
          userId: "u3",
          nudgeType: "gentle_return" as const,
          signal: "sent" as const,
          lane: "student" as const,
          occurredAt: now - 40 * 60 * 1000,
        },
        {
          userId: "u3",
          nudgeType: "gentle_return" as const,
          signal: "sent" as const,
          lane: "student" as const,
          occurredAt: now - 5 * 60 * 1000,
        },
      ];
      const result = markExpiredAsIgnored("u3", "student", records);
      expect(result).toHaveLength(1);
      expect(result[0]!.signal).toBe("ignored");
    });
  });

  describe("nudge-copy", () => {
    it("maps all lanes to correct categories", () => {
      expect(laneToCategory("student")).toBe("study");
      expect(laneToCategory("game_like")).toBe("run");
      expect(laneToCategory("deep_creative")).toBe("project");
      expect(laneToCategory("minimal_normal")).toBe("clean");
    });

    it("returns null title/body for none type", () => {
      const copy = copyFor("student", "none");
      expect(copy.title).toBeNull();
      expect(copy.body).toBeNull();
    });

    it("returns rescue copy for each lane", () => {
      const lanes = ["student", "game_like", "deep_creative", "minimal_normal"] as const;
      for (const lane of lanes) {
        const copy = copyFor(lane, "rescue");
        expect(copy.title).toBeTruthy();
        expect(copy.body).toBeTruthy();
      }
    });

    it("returns study_deadline copy", () => {
      const copy = copyFor("student", "study_deadline");
      expect(copy.title).toBe("Small window");
      expect(copy.body).toContain("15 minutes");
    });

    it("returns weekly_insight copy", () => {
      const copy = copyFor("student", "weekly_insight");
      expect(copy.title).toContain("weekly intelligence");
    });
  });

  describe("notification-policy-bridge", () => {
    it("blocks at budget limit", () => {
      const result = checkNotificationBudget({
        userId: "bridge-1",
        lane: "student",
        completedSessions: 5,
        daysSinceOnboarding: 3,
        quietHoursActive: false,
        userMuted: false,
        context: "none",
        sentToday: 2,
      });
      expect(result.blocked).toBe(true);
      expect(result.budgetRemaining).toBe(0);
    });

    it("allows under budget", () => {
      const result = checkNotificationBudget({
        userId: "bridge-2",
        lane: "student",
        completedSessions: 5,
        daysSinceOnboarding: 3,
        quietHoursActive: false,
        userMuted: false,
        context: "none",
        sentToday: 1,
      });
      expect(result.blocked).toBe(false);
      expect(result.budgetRemaining).toBe(1);
    });

    it("blocks when user muted", () => {
      const result = checkNotificationBudget({
        userId: "bridge-3",
        lane: "deep_creative",
        completedSessions: 5,
        daysSinceOnboarding: 4,
        quietHoursActive: false,
        userMuted: true,
        context: "none",
        sentToday: 0,
      });
      expect(result.blocked).toBe(true);
      expect(result.reason).toContain("mute");
    });

    it("returns maxDaily correctly per lane", () => {
      const minimal = checkNotificationBudget({
        userId: "bridge-4",
        lane: "minimal_normal",
        completedSessions: 1,
        daysSinceOnboarding: 1,
        quietHoursActive: false,
        userMuted: false,
        context: "none",
        sentToday: 0,
      });
      expect(minimal.maxDaily).toBe(1);

      const student = checkNotificationBudget({
        userId: "bridge-5",
        lane: "student",
        completedSessions: 2,
        daysSinceOnboarding: 2,
        quietHoursActive: false,
        userMuted: false,
        context: "none",
        sentToday: 0,
      });
      expect(student.maxDaily).toBe(2);
    });

    it("returns valid NudgeDecision in result", () => {
      const result = checkNotificationBudget({
        userId: "bridge-6",
        lane: "game_like",
        completedSessions: 4,
        daysSinceOnboarding: 3,
        quietHoursActive: false,
        userMuted: false,
        context: "avoidance",
        sentToday: 0,
      });
      expect(() => NudgeDecisionSchema.parse(result.decision)).not.toThrow();
    });
  });

  describe("NudgeSignalRecordSchema", () => {
    it("validates all signal types", () => {
      const signalTypes = [
        "sent",
        "opened",
        "dismissed",
        "ignored",
        "rescue_started",
        "session_completed",
      ] as const;

      for (const signal of signalTypes) {
        const record = {
          userId: "user-1",
          nudgeType: "gentle_return",
          signal,
          lane: "student",
          occurredAt: Date.now(),
        };
        expect(() => NudgeSignalRecordSchema.parse(record)).not.toThrow();
      }
    });

    it("rejects invalid signal type", () => {
      const record = {
        userId: "user-1",
        nudgeType: "none",
        signal: "clicked",
        lane: "student",
        occurredAt: Date.now(),
      };
      expect(() => NudgeSignalRecordSchema.parse(record)).toThrow();
    });
  });

  describe("decideNudge — paused categories", () => {
    it("blocks nudges for paused category lane", () => {
      const blocked = decideNudge({
        lane: "student",
        completedSessions: 5,
        daysSinceOnboarding: 7,
        pausedCategories: ["study"],
      });
      expect(blocked.allowed).toBe(false);
    });

    it("allows nudges for non-paused category", () => {
      const result = decideNudge({
        lane: "student",
        completedSessions: 5,
        daysSinceOnboarding: 7,
        pausedCategories: ["run"],
      });
      expect(result.allowed).toBe(true);
    });
  });
});
