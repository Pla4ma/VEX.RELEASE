import { decideNudge } from "../service";
import { laneToCategory, copyFor } from "../nudge-copy";

describe("notification policy — copy", () => {
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
      expect(result.title).toBe("Need a recovery run?");
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
});
