import { normalizeLane } from "../service";

const ALL_LANES = ["student", "game_like", "deep_creative", "minimal_normal"] as const;

describe("mode-retention comprehensive", () => {
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
});
