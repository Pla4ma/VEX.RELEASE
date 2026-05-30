import { getModeDayCopy } from "../service";
import { ModeDayCopySchema } from "../schemas";
import { MODE_DAY1_COPY, MODE_DAY3_MEMORY, MODE_DAY7_INTELLIGENCE } from "../copy";

const ALL_LANES = ["student", "game_like", "deep_creative", "minimal_normal"] as const;

describe("mode-retention comprehensive", () => {
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
});
