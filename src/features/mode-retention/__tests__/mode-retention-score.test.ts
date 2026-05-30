import { scoreModeRetention } from "../service";
import { ModeRetentionScoreSchema } from "../schemas";

describe("mode-retention comprehensive", () => {
  describe("scoreModeRetention", () => {
    it("scores full retention at 52 (9+9+8+8+9+9)", () => {
      const score = scoreModeRetention({
        lane: "student",
        hasNextAction: true,
        hasCompletionContext: true,
        hasMemoryInsight: true,
        hasWeeklyIntelligence: true,
        nudgeCopyIsSpecific: true,
        returnReasonIsModeSpecific: true,
      });
      expect(score.totalScore).toBe(52);
      expect(score.returnReasonStrength).toBe(9);
      expect(score.nextActionClarity).toBe(9);
      expect(score.completionContextSaved).toBe(8);
      expect(score.memoryRelevance).toBe(8);
      expect(score.intelligenceValue).toBe(9);
      expect(score.nudgeSpecificity).toBe(9);
    });

    it("scores minimum retention at 17 (4+3+2+2+3+3)", () => {
      const score = scoreModeRetention({
        lane: "minimal_normal",
        hasNextAction: false,
        hasCompletionContext: false,
        hasMemoryInsight: false,
        hasWeeklyIntelligence: false,
        nudgeCopyIsSpecific: false,
        returnReasonIsModeSpecific: false,
      });
      expect(score.totalScore).toBe(17);
      expect(score.returnReasonStrength).toBe(4);
      expect(score.memoryRelevance).toBe(2);
    });

    it("summary includes return reason and score", () => {
      const score = scoreModeRetention({ lane: "game_like" });
      expect(score.summary).toContain("/60");
      expect(score.summary.length).toBeGreaterThan(0);
    });

    it("validates against ModeRetentionScoreSchema", () => {
      const score = scoreModeRetention({ lane: "deep_creative" });
      expect(ModeRetentionScoreSchema.safeParse(score).success).toBe(true);
    });

    it("score is between 0 and 60", () => {
      const score = scoreModeRetention({
        lane: "student",
        hasNextAction: false,
        hasCompletionContext: false,
        hasMemoryInsight: false,
        hasWeeklyIntelligence: false,
        nudgeCopyIsSpecific: false,
        returnReasonIsModeSpecific: false,
      });
      expect(score.totalScore).toBeGreaterThanOrEqual(0);
      expect(score.totalScore).toBeLessThanOrEqual(60);
    });
  });
});
