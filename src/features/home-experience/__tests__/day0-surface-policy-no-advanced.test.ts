import { makeDay0Map } from "./day0-surface-policy.helpers";

describe("Day 0 Surface Policy", () => {
  describe("no advanced features on Day 0", () => {
    it("blocks boss_full_cta", () => {
      const map = makeDay0Map();
      expect(map.boss_full_cta).toMatch(/hidden|blocked/);
    });

    it("blocks challenge_teaser", () => {
      const map = makeDay0Map();
      expect(map.challenge_teaser).toMatch(/hidden|blocked/);
    });

    it("blocks weekly_quest", () => {
      const map = makeDay0Map();
      expect(map.weekly_quest).toMatch(/hidden|blocked/);
    });

    it("blocks progress_proof", () => {
      const map = makeDay0Map();
      expect(map.progress_proof).toMatch(/hidden|blocked/);
    });

    it("blocks focus_score", () => {
      const map = makeDay0Map();
      expect(map.focus_score).toMatch(/hidden|blocked/);
    });

    it("blocks progress_detail", () => {
      const map = makeDay0Map();
      expect(map.progress_detail).toMatch(/hidden|blocked/);
    });
  });
});
