/**
 * Comprehensive tests for mode-retention feature.
 *
 * Covers: service.ts (normalizeLane, getModeRetentionManifest, getModeReturnHook,
 * getModeDayCopy, getModeRescueCopy, getModeNotificationCopy, getModePremiumBridge,
 * scoreModeRetention, scoreAllModes, buildDefaultAuditScores),
 * service-day-copy.ts (getModeDayCopy for all lane/day combos),
 * schemas.ts (all Zod schemas), copy.ts, copy-manifest.ts.
 */

import {
  normalizeLane,
  getModeRetentionManifest,
  getModeReturnHook,
  getModeDayCopy,
  getModeRescueCopy,
  getModeNotificationCopy,
  getModePremiumBridge,
  scoreModeRetention,
  scoreAllModes,
  buildDefaultAuditScores,
} from "../service";
import {
  ModeRetentionScoreSchema,
  ModeReturnHookSchema,
  ModeDayCopySchema,
  ModeRescueCopySchema,
  ModeNotificationCopySchema,
  ModePremiumBridgeSchema,
  ModeRetentionManifestSchema,
} from "../schemas";
import {
  MODE_RETURN_HOOK,
  MODE_RETURN_REASON,
  MODE_DAY1_COPY,
  MODE_DAY3_MEMORY,
  MODE_DAY7_INTELLIGENCE,
  MODE_RESCUE_COPY,
  MODE_NOTIFICATION_COPY,
  MODE_PREMIUM_BRIDGE,
  MODE_RETENTION_MANIFEST,
} from "../copy";

const ALL_LANES = ["student", "game_like", "deep_creative", "minimal_normal"] as const;

describe("mode-retention comprehensive", () => {
  /* ─── normalizeLane ──────────────────────────────────────────── */

  describe("normalizeLane", () => {
    it("returns valid lanes unchanged", () => {
      for (const lane of ALL_LANES) {
        expect(normalizeLane(lane)).toBe(lane);
      }
    });

    it("falls back to minimal_normal for unknown input", () => {
      expect(normalizeLane("unknown")).toBe("minimal_normal");
      expect(normalizeLane(undefined)).toBe("minimal_normal");
      expect(normalizeLane(null)).toBe("minimal_normal");
      expect(normalizeLane(42)).toBe("minimal_normal");
      expect(normalizeLane("")).toBe("minimal_normal");
    });
  });

  /* ─── getModeRetentionManifest ───────────────────────────────── */

  describe("getModeRetentionManifest", () => {
    it("returns a valid manifest for each lane", () => {
      for (const lane of ALL_LANES) {
        const manifest = getModeRetentionManifest(lane);
        expect(ModeRetentionManifestSchema.safeParse(manifest).success).toBe(true);
        expect(manifest.lane).toBe(lane);
        expect(manifest.returnReason.length).toBeGreaterThan(0);
        expect(manifest.hookCopy.length).toBeGreaterThan(0);
        expect(manifest.day1Copy.length).toBeGreaterThan(0);
      }
    });

    it("manifest has all required sub-objects", () => {
      const manifest = getModeRetentionManifest("student");
      expect(manifest.rescueCopy).toBeDefined();
      expect(manifest.notificationCopy).toBeDefined();
      expect(manifest.premiumBridge).toBeDefined();
    });
  });

  /* ─── getModeReturnHook ──────────────────────────────────────── */

  describe("getModeReturnHook", () => {
    it("returns valid return hook for each lane", () => {
      for (const lane of ALL_LANES) {
        const hook = getModeReturnHook(lane);
        expect(ModeReturnHookSchema.safeParse(hook).success).toBe(true);
        expect(hook.lane).toBe(lane);
        expect(hook.corePromise.length).toBeGreaterThan(0);
        expect(hook.day0Headline.length).toBeGreaterThan(0);
      }
    });

    it("falls back to minimal_normal for unknown input", () => {
      const hook = getModeReturnHook("bogus");
      expect(hook.lane).toBe("minimal_normal");
      expect(hook.corePromise).toBe(MODE_RETURN_REASON.minimal_normal);
    });

    it("study hook references study-specific language", () => {
      const hook = getModeReturnHook("student");
      expect(hook.corePromise).toContain("study");
    });

    it("game_like hook references momentum/run language", () => {
      const hook = getModeReturnHook("game_like");
      expect(hook.corePromise).toContain("momentum");
    });

    it("deep_creative hook references left-off language", () => {
      const hook = getModeReturnHook("deep_creative");
      expect(hook.corePromise).toContain("remembers");
    });

    it("minimal_normal hook references clean/noise language", () => {
      const hook = getModeReturnHook("minimal_normal");
      expect(hook.corePromise).toContain("one useful action");
    });
  });

  /* ─── getModeDayCopy ─────────────────────────────────────────── */

  describe("getModeDayCopy", () => {
    it("returns valid day copy for day 0 for each lane", () => {
      for (const lane of ALL_LANES) {
        const copy = getModeDayCopy(lane, 0);
        expect(ModeDayCopySchema.safeParse(copy).success).toBe(true);
        expect(copy.day).toBe(0);
        expect(copy.sessionMinutes).toBeGreaterThanOrEqual(5);
      }
    });

    it("returns valid day copy for day 1", () => {
      for (const lane of ALL_LANES) {
        const copy = getModeDayCopy(lane, 1);
        expect(copy.day).toBe(1);
        expect(copy.homeMessage).toBe(MODE_DAY1_COPY[lane]);
      }
    });

    it("returns valid day copy for day 3 with memory", () => {
      for (const lane of ALL_LANES) {
        const copy = getModeDayCopy(lane, 3);
        expect(copy.day).toBe(3);
        expect(copy.homeMessage).toBe(MODE_DAY3_MEMORY[lane]);
      }
    });

    it("returns valid day copy for day 7 with intelligence", () => {
      for (const lane of ALL_LANES) {
        const copy = getModeDayCopy(lane, 7);
        expect(copy.day).toBe(7);
        expect(copy.homeMessage).toBe(MODE_DAY7_INTELLIGENCE[lane]);
      }
    });

    it("returns fallback copy for non-milestone days (e.g. 2, 5)", () => {
      const copy = getModeDayCopy("student", 2);
      expect(copy.day).toBe(2);
      expect(copy.sessionMinutes).toBe(15);
      expect(copy.primaryCta).toBe("Start session");
    });

    it("day 0 session minutes vary by lane", () => {
      expect(getModeDayCopy("student", 0).sessionMinutes).toBe(15);
      expect(getModeDayCopy("game_like", 0).sessionMinutes).toBe(15);
      expect(getModeDayCopy("deep_creative", 0).sessionMinutes).toBe(20);
      expect(getModeDayCopy("minimal_normal", 0).sessionMinutes).toBe(10);
    });

    it("day 0 primaryCta is lane-specific", () => {
      expect(getModeDayCopy("student", 0).primaryCta).toBe("Start first study block");
      expect(getModeDayCopy("game_like", 0).primaryCta).toBe("Start first run");
      expect(getModeDayCopy("deep_creative", 0).primaryCta).toBe("Start first project session");
      expect(getModeDayCopy("minimal_normal", 0).primaryCta).toBe("Start first clean block");
    });

    it("day 3 primaryCta varies by lane", () => {
      expect(getModeDayCopy("student", 3).primaryCta).toContain("study pattern");
      expect(getModeDayCopy("game_like", 3).primaryCta).toContain("run pattern");
      expect(getModeDayCopy("deep_creative", 3).primaryCta).toContain("project path");
      expect(getModeDayCopy("minimal_normal", 3).primaryCta).toContain("rhythm");
    });
  });

  /* ─── getModeRescueCopy ──────────────────────────────────────── */

  describe("getModeRescueCopy", () => {
    it("returns valid rescue copy for each lane", () => {
      for (const lane of ALL_LANES) {
        const rescue = getModeRescueCopy(lane);
        expect(ModeRescueCopySchema.safeParse(rescue).success).toBe(true);
        expect(rescue.lane).toBe(lane);
        expect(rescue.sessionMinutes).toBeGreaterThanOrEqual(3);
        expect(rescue.sessionMinutes).toBeLessThanOrEqual(15);
      }
    });

    it("student rescue is 8 minutes", () => {
      expect(getModeRescueCopy("student").sessionMinutes).toBe(8);
    });

    it("game_like rescue is 10 minutes", () => {
      expect(getModeRescueCopy("game_like").sessionMinutes).toBe(10);
    });

    it("deep_creative rescue is 7 minutes", () => {
      expect(getModeRescueCopy("deep_creative").sessionMinutes).toBe(7);
    });

    it("minimal_normal rescue is 5 minutes", () => {
      expect(getModeRescueCopy("minimal_normal").sessionMinutes).toBe(5);
    });

    it("falls back to minimal_normal for unknown lane", () => {
      const rescue = getModeRescueCopy("bogus");
      expect(rescue.lane).toBe("minimal_normal");
    });
  });

  /* ─── getModeNotificationCopy ────────────────────────────────── */

  describe("getModeNotificationCopy", () => {
    it("returns valid notification copy for each lane", () => {
      for (const lane of ALL_LANES) {
        const notif = getModeNotificationCopy(lane);
        expect(ModeNotificationCopySchema.safeParse(notif).success).toBe(true);
        expect(notif.lane).toBe(lane);
        expect(notif.maxPerDay).toBeGreaterThanOrEqual(0);
        expect(notif.maxPerDay).toBeLessThanOrEqual(3);
      }
    });

    it("all notifications have maxPerDay of 1", () => {
      for (const lane of ALL_LANES) {
        expect(getModeNotificationCopy(lane).maxPerDay).toBe(1);
      }
    });

    it("titles are unique per lane", () => {
      const titles = ALL_LANES.map((l) => getModeNotificationCopy(l).title);
      expect(new Set(titles).size).toBe(4);
    });
  });

  /* ─── getModePremiumBridge ───────────────────────────────────── */

  describe("getModePremiumBridge", () => {
    it("returns valid premium bridge for each lane", () => {
      for (const lane of ALL_LANES) {
        const bridge = getModePremiumBridge(lane);
        expect(ModePremiumBridgeSchema.safeParse(bridge).success).toBe(true);
        expect(bridge.lane).toBe(lane);
        expect(bridge.triggerDay).toBe(7);
      }
    });

    it("headlines are unique per lane", () => {
      const headlines = ALL_LANES.map((l) => getModePremiumBridge(l).headline);
      expect(new Set(headlines).size).toBe(4);
    });

    it("falls back to minimal_normal for unknown lane", () => {
      const bridge = getModePremiumBridge("bogus");
      expect(bridge.lane).toBe("minimal_normal");
    });
  });

  /* ─── scoreModeRetention ─────────────────────────────────────── */

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

  /* ─── scoreAllModes ──────────────────────────────────────────── */

  describe("scoreAllModes", () => {
    it("returns one score per input", () => {
      const inputs = ALL_LANES.map((lane) => ({ lane }));
      const scores = scoreAllModes(inputs);
      expect(scores).toHaveLength(4);
    });

    it("each score matches its lane", () => {
      const inputs = ALL_LANES.map((lane) => ({ lane }));
      const scores = scoreAllModes(inputs);
      scores.forEach((score, i) => {
        expect(score.lane).toBe(ALL_LANES[i]);
      });
    });
  });

  /* ─── buildDefaultAuditScores ────────────────────────────────── */

  describe("buildDefaultAuditScores", () => {
    it("returns 4 scores, one per lane", () => {
      const scores = buildDefaultAuditScores();
      expect(scores).toHaveLength(4);
      const lanes = scores.map((s) => s.lane);
      expect(lanes).toContain("student");
      expect(lanes).toContain("game_like");
      expect(lanes).toContain("deep_creative");
      expect(lanes).toContain("minimal_normal");
    });

    it("minimal_normal has lower memory relevance than other lanes", () => {
      const scores = buildDefaultAuditScores();
      const minimal = scores.find((s) => s.lane === "minimal_normal")!;
      const others = scores.filter((s) => s.lane !== "minimal_normal");
      for (const other of others) {
        expect(minimal.memoryRelevance).toBeLessThan(other.memoryRelevance);
      }
    });

    it("all default scores have totalScore > 0", () => {
      const scores = buildDefaultAuditScores();
      for (const score of scores) {
        expect(score.totalScore).toBeGreaterThan(0);
      }
    });
  });

  /* ─── Copy data integrity ────────────────────────────────────── */

  describe("copy data – integrity checks", () => {
    it("all copy maps have exactly 4 entries", () => {
      expect(Object.keys(MODE_RETURN_HOOK)).toHaveLength(4);
      expect(Object.keys(MODE_RETURN_REASON)).toHaveLength(4);
      expect(Object.keys(MODE_DAY1_COPY)).toHaveLength(4);
      expect(Object.keys(MODE_DAY3_MEMORY)).toHaveLength(4);
      expect(Object.keys(MODE_DAY7_INTELLIGENCE)).toHaveLength(4);
      expect(Object.keys(MODE_RESCUE_COPY)).toHaveLength(4);
      expect(Object.keys(MODE_NOTIFICATION_COPY)).toHaveLength(4);
      expect(Object.keys(MODE_PREMIUM_BRIDGE)).toHaveLength(4);
      expect(Object.keys(MODE_RETENTION_MANIFEST)).toHaveLength(4);
    });

    it("return reasons are unique across all lanes", () => {
      const reasons = Object.values(MODE_RETURN_REASON);
      expect(new Set(reasons).size).toBe(4);
    });

    it("no copy contains game reward language", () => {
      for (const copy of Object.values(MODE_RETENTION_MANIFEST)) {
        const text = JSON.stringify(copy);
        expect(text).not.toMatch(/boss|battle|coin|gem|reward.?chest|defeat|loot/i);
      }
    });

    it("no copy contains streak guilt language", () => {
      for (const copy of Object.values(MODE_RETENTION_MANIFEST)) {
        const text = JSON.stringify(copy);
        expect(text).not.toMatch(/lost.*streak|broke.*streak|keep.*streak|don't.*break/i);
      }
    });
  });
});
