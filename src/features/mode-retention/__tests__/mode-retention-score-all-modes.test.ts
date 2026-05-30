import { scoreAllModes } from "../service";

const ALL_LANES = ["student", "game_like", "deep_creative", "minimal_normal"] as const;

describe("mode-retention comprehensive", () => {
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
});
