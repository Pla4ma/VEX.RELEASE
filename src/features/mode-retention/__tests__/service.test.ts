import { scoreModeRetention, buildDefaultAuditScores, getModeReturnHook, getModeRescueCopy, getModeNotificationCopy, getModePremiumBridge, getModeDayCopy, getModeRetentionManifest } from "../service";
import { MODE_RETENTION_MANIFEST, MODE_RETURN_HOOK, MODE_RETURN_REASON, MODE_DAY3_MEMORY, MODE_DAY7_INTELLIGENCE, MODE_RESCUE_COPY, MODE_NOTIFICATION_COPY, MODE_PREMIUM_BRIDGE } from "../copy";

describe("mode-retention scoring", () => {
  describe("scoreModeRetention", () => {
    it("scores study mode with full retention", () => {
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
      expect(score.nudgeSpecificity).toBe(9);
      expect(score.summary).toContain("VEX knows what I need to study or review next");
    });

    it("scores clean mode lower when memory insight absent", () => {
      const score = scoreModeRetention({
        lane: "minimal_normal",
        hasNextAction: true,
        hasCompletionContext: true,
        hasMemoryInsight: false,
        hasWeeklyIntelligence: true,
        nudgeCopyIsSpecific: true,
        returnReasonIsModeSpecific: true,
      });
      expect(score.totalScore).toBeLessThan(52);
      expect(score.memoryRelevance).toBe(2);
    });

    it("scores all modes differently via buildDefaultAuditScores", () => {
      const scores = buildDefaultAuditScores();
      expect(scores).toHaveLength(4);
      const totalScores = scores.map((s) => s.totalScore);
      expect(totalScores.filter((s) => s === totalScores[0])).not.toHaveLength(4);
    });
  });

  describe("getModeReturnHook", () => {
    it("returns study-specific return hook", () => {
      const hook = getModeReturnHook("student");
      expect(hook.corePromise).toBe("VEX knows what I need to study or review next.");
      expect(hook.day0Headline).toBe("Your next study block is ready.");
    });

    it("returns run-specific return hook", () => {
      const hook = getModeReturnHook("game_like");
      expect(hook.corePromise).toBe("VEX helps me build momentum and understand what blocks me.");
    });

    it("returns project-specific return hook", () => {
      const hook = getModeReturnHook("deep_creative");
      expect(hook.corePromise).toBe("VEX remembers where I left off.");
    });

    it("returns clean-specific return hook", () => {
      const hook = getModeReturnHook("minimal_normal");
      expect(hook.corePromise).toBe("VEX gives me one useful action without noise.");
    });

    it("falls back to minimal_normal for unknown lane", () => {
      const hook = getModeReturnHook(undefined);
      expect(hook.corePromise).toBe("VEX gives me one useful action without noise.");
    });
  });

  describe("getModeRescueCopy", () => {
    it("returns study rescue", () => {
      const rescue = getModeRescueCopy("student");
      expect(rescue.headline).toBe("Review one weak section for 8 minutes");
      expect(rescue.sessionMinutes).toBe(8);
    });

    it("returns run rescue", () => {
      const rescue = getModeRescueCopy("game_like");
      expect(rescue.headline).toBe("Recovery run: 10 clean minutes");
      expect(rescue.sessionMinutes).toBe(10);
    });

    it("returns project rescue", () => {
      const rescue = getModeRescueCopy("deep_creative");
      expect(rescue.headline).toBe("Re-enter the project and find the next move");
    });

    it("returns clean rescue", () => {
      const rescue = getModeRescueCopy("minimal_normal");
      expect(rescue.headline).toBe("Do 5 minutes. Stop cleanly.");
      expect(rescue.sessionMinutes).toBe(5);
    });
  });

  describe("getModeNotificationCopy", () => {
    it("returns mode-specific notification per lane", () => {
      const lanes = ["student", "game_like", "deep_creative", "minimal_normal"] as const;
      const titles = lanes.map((l) => getModeNotificationCopy(l).title);
      expect(new Set(titles).size).toBe(4);
    });

    it("all notifications have maxPerDay <= 1", () => {
      const lanes = ["student", "game_like", "deep_creative", "minimal_normal"] as const;
      for (const l of lanes) {
        expect(getModeNotificationCopy(l).maxPerDay).toBeLessThanOrEqual(1);
      }
    });
  });

  describe("getModePremiumBridge", () => {
    it("returns mode-specific premium bridges", () => {
      const lanes = ["student", "game_like", "deep_creative", "minimal_normal"] as const;
      const headlines = lanes.map((l) => getModePremiumBridge(l).headline);
      expect(headlines).toContain("Go deeper with Study Intelligence");
      expect(headlines).toContain("Unlock advanced Run Intelligence");
      expect(headlines).toContain("Unlock Project Memory");
      expect(headlines).toContain("Unlock Focus Intelligence");
    });
  });

  describe("getModeDayCopy", () => {
    it("returns day 0 copy for study", () => {
      const copy = getModeDayCopy("student", 0);
      expect(copy.day).toBe(0);
      expect(copy.sessionMinutes).toBe(15);
    });

    it("returns day 1 copy for run", () => {
      const copy = getModeDayCopy("game_like", 1);
      expect(copy.day).toBe(1);
      expect(copy.homeMessage).toBe("Start one clean run before friction stacks.");
    });

    it("returns day 3 memory for project", () => {
      const copy = getModeDayCopy("deep_creative", 3);
      expect(copy.day).toBe(3);
      expect(copy.homeMessage).toBe("VEX noticed your project thread gets easier to resume when the next move is specific.");
    });

    it("returns day 7 intelligence for clean", () => {
      const copy = getModeDayCopy("minimal_normal", 7);
      expect(copy.day).toBe(7);
      expect(copy.homeMessage).toBe("Your cleanest sessions happened when VEX stayed quiet.");
    });
  });

  describe("getModeRetentionManifest", () => {
    it("returns a manifest for each valid lane", () => {
      for (const lane of ["student", "game_like", "deep_creative", "minimal_normal"] as const) {
        const manifest = getModeRetentionManifest(lane);
        expect(manifest.lane).toBe(lane);
        expect(manifest.returnReason).toBeTruthy();
        expect(manifest.rescueCopy.headline).toBeTruthy();
        expect(manifest.premiumBridge.headline).toBeTruthy();
      }
    });
  });
});

describe("mode-retention copy integrity", () => {
  it("every lane has a return hook", () => {
    expect(Object.keys(MODE_RETURN_HOOK)).toHaveLength(4);
  });

  it("every lane has a return reason", () => {
    expect(Object.keys(MODE_RETURN_REASON)).toHaveLength(4);
  });

  it("every lane has a Day 3 memory", () => {
    expect(Object.keys(MODE_DAY3_MEMORY)).toHaveLength(4);
  });

  it("every lane has a Day 7 intelligence", () => {
    expect(Object.keys(MODE_DAY7_INTELLIGENCE)).toHaveLength(4);
  });

  it("every lane has rescue copy", () => {
    expect(Object.keys(MODE_RESCUE_COPY)).toHaveLength(4);
  });

  it("every lane has notification copy", () => {
    expect(Object.keys(MODE_NOTIFICATION_COPY)).toHaveLength(4);
  });

  it("every lane has premium bridge", () => {
    expect(Object.keys(MODE_PREMIUM_BRIDGE)).toHaveLength(4);
  });

  it("every lane has a complete manifest", () => {
    expect(Object.keys(MODE_RETENTION_MANIFEST)).toHaveLength(4);
  });

  it("no two modes share the same return reason", () => {
    const reasons = Object.values(MODE_RETURN_REASON);
    expect(new Set(reasons).size).toBe(4);
  });

  it("no two modes share the same Day 3 memory", () => {
    const memories = Object.values(MODE_DAY3_MEMORY);
    expect(new Set(memories).size).toBe(4);
  });

  it("no two modes share the same Day 7 intelligence", () => {
    const insights = Object.values(MODE_DAY7_INTELLIGENCE);
    expect(new Set(insights).size).toBe(4);
  });

  it("all rescue copy uses shame-reducing language", () => {
    for (const rescue of Object.values(MODE_RESCUE_COPY)) {
      const text = `${rescue.headline} ${rescue.body}`;
      expect(text).not.toMatch(/fail|missed|behind|should have/);
    }
  });

  it("no copy uses game reward language", () => {
    for (const copy of Object.values(MODE_RETENTION_MANIFEST)) {
      const text = JSON.stringify(copy);
      expect(text).not.toMatch(/boss|battle|coin|gem|reward.?chest|defeat|loot/);
    }
  });

  it("no copy uses streak guilt language", () => {
    for (const copy of Object.values(MODE_RETENTION_MANIFEST)) {
      const text = JSON.stringify(copy);
      expect(text).not.toMatch(/lost.*streak|broke.*streak|keep.*streak|don't.*break/);
    }
  });
});
