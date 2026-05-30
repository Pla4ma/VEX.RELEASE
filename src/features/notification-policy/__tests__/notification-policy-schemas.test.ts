import { decideNudge } from "../service";
import { NudgeDecisionSchema, NudgeSignalRecordSchema } from "../schemas";

describe("notification policy — schemas", () => {
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
});
