import { decideHomeSurfaces } from "../home-surface-decision";
import {
  featureAvailability,
  baseStats,
  visibleCount,
  day0Map,
} from "./day0-surface-counts-helpers";

describe("Phase 3 — Day 0 lane surface counts", () => {
  describe("Day 0 surface count per lane", () => {
    it("Study Home Day 0 <= 5 surfaces", () => {
      const map = day0Map({
        motivationStyle: "study_focused",
        primaryGoal: "study",
        laneProfile: { primaryLane: "student" },
      });
      expect(visibleCount(map)).toBeLessThanOrEqual(5);
      expect(map.start_session).toBe("primary");
      expect(map.study_os).toMatch(/hidden|blocked/);
    });

    it("Run Home Day 0 <= 5 surfaces", () => {
      const map = day0Map({
        motivationStyle: "game_like",
        gamificationIntensity: "strong",
        laneProfile: { primaryLane: "game_like" },
      });
      expect(visibleCount(map)).toBeLessThanOrEqual(5);
      expect(map.start_session).toBe("primary");
      expect(map.run_board).toMatch(/hidden|blocked/);
    });

    it("Project Home Day 0 <= 5 surfaces", () => {
      const map = day0Map({
        motivationStyle: "coach_led",
        primaryGoal: "creative",
        laneProfile: { primaryLane: "deep_creative" },
      });
      expect(visibleCount(map)).toBeLessThanOrEqual(5);
      expect(map.start_session).toBe("primary");
      expect(map.project_thread).toMatch(/hidden|blocked/);
    });

    it("Clean Home Day 0 <= 5 surfaces", () => {
      const map = day0Map({
        motivationStyle: "calm",
        gamificationIntensity: "minimal",
        laneProfile: { primaryLane: "minimal_normal" },
      });
      const count = visibleCount(map);
      expect(count).toBeLessThanOrEqual(5);
      expect(count).toBeGreaterThanOrEqual(3);
      expect(map.start_session).toBe("primary");
    });
  });

  describe("Hidden systems blocked on Day 0", () => {
    const map = day0Map({
      motivationStyle: "study_focused",
      primaryGoal: "study",
    });

    it("study_os blocked on Day 0", () => {
      expect(map.study_os).toMatch(/hidden|blocked/);
    });
    it("run_board blocked on Day 0", () => {
      expect(map.run_board).toMatch(/hidden|blocked/);
    });
    it("project_thread blocked on Day 0", () => {
      expect(map.project_thread).toMatch(/hidden|blocked/);
    });
    it("focus_window blocked on Day 0", () => {
      expect(map.focus_window).toMatch(/hidden|blocked/);
    });
    it("weekly_intelligence blocked on Day 0", () => {
      expect(map.weekly_intelligence).toMatch(/hidden|blocked/);
    });
    it("memory_insight blocked on Day 0", () => {
      expect(map.memory_insight).toMatch(/hidden|blocked/);
    });
    it("boss_compact blocked on Day 0", () => {
      expect(map.boss_compact).toMatch(/hidden|blocked/);
    });
    it("boss_full_cta blocked on Day 0", () => {
      expect(map.boss_full_cta).toMatch(/hidden|blocked/);
    });
    it("challenge_teaser blocked on Day 0", () => {
      expect(map.challenge_teaser).toMatch(/hidden|blocked/);
    });
    it("weekly_quest blocked on Day 0", () => {
      expect(map.weekly_quest).toMatch(/hidden|blocked/);
    });
    it("premium_tease blocked on Day 0", () => {
      expect(map.premium_tease).toMatch(/hidden|blocked/);
    });
    it("focus_score blocked on Day 0", () => {
      expect(map.focus_score).toMatch(/hidden|blocked/);
    });
    it("progress_proof blocked on Day 0", () => {
      expect(map.progress_proof).toMatch(/hidden|blocked/);
    });
    it("progress_detail blocked on Day 0", () => {
      expect(map.progress_detail).toMatch(/hidden|blocked/);
    });
  });
});
