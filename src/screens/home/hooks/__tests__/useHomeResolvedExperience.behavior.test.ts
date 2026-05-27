import type { SessionEntry } from "./useHomeResolvedExperience.helpers";
import {
  computeStudyUsageRatio,
  computePreferredMode,
  computeCompletedDurations,
  computeBestTimeOfDay,
  computeBossEngagement,
  computeCoachInteractions,
} from "./useHomeResolvedExperience.helpers";

describe("useHomeResolvedExperience — behavior stat computation", () => {
  it("study usage ratio increases when recent sessions are study", () => {
    const sessions: SessionEntry[] = [
      { mode: "STUDY" },
      { mode: "STUDY" },
      { mode: "FOCUS" },
      { mode: "STUDY" },
    ];
    const ratio = computeStudyUsageRatio(sessions, 4);
    expect(ratio).toBe(0.75);
  });

  it("study usage ratio is 0 with no study sessions", () => {
    const sessions: SessionEntry[] = [{ mode: "FOCUS" }, { mode: "FOCUS" }];
    const ratio = computeStudyUsageRatio(sessions, 2);
    expect(ratio).toBe(0);
  });

  it("preferred session mode is derived from recent sessions", () => {
    const sessions: SessionEntry[] = [
      { mode: "FOCUS" },
      { mode: "STUDY" },
      { mode: "STUDY" },
      { mode: "STUDY" },
    ];
    expect(computePreferredMode(sessions)).toBe("STUDY");
  });

  it("preferred session mode returns null for empty history", () => {
    expect(computePreferredMode([])).toBeNull();
  });

  it("completed session durations extracted from history", () => {
    const sessions: SessionEntry[] = [
      { duration: 600 },
      { effectiveDuration: 900 },
      { duration: 0 },
    ];
    const durations = computeCompletedDurations(sessions);
    expect(durations).toEqual([600, 900]);
  });

  it("best time of day derived from top quality sessions", () => {
    const localMorning = new Date("2024-01-15T10:00:00").getTime() / 1000;
    const sessions: SessionEntry[] = [
      { startTime: localMorning, focusQuality: 95 },
      { startTime: localMorning + 3600, focusQuality: 90 },
      { startTime: localMorning + 3600 * 2, focusQuality: 88 },
    ];
    const timeOfDay = computeBestTimeOfDay(sessions);
    expect(["morning", "early_morning"]).toContain(timeOfDay);
  });

  it("best time of day returns null with insufficient quality data", () => {
    expect(computeBestTimeOfDay([])).toBeNull();
    expect(
      computeBestTimeOfDay([{ startTime: 1, focusQuality: 50 }]),
    ).toBeNull();
  });

  it("boss engagement is high with 3+ encounters", () => {
    expect(computeBossEngagement(true, 3)).toBe("high");
  });

  it("boss engagement is medium with 1 encounter", () => {
    expect(computeBossEngagement(true, 1)).toBe("medium");
  });

  it("boss engagement is none without active boss", () => {
    expect(computeBossEngagement(false, 5)).toBe("none");
  });

  it("coach interactions count primary recommendation + accepted", () => {
    expect(computeCoachInteractions(true, 2)).toBe(3);
  });

  it("coach interactions is 0 with no recommendations", () => {
    expect(computeCoachInteractions(false, 0)).toBe(0);
  });
});
