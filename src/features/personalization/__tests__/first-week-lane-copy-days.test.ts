import { resolveFirstWeekExperience } from "../first-week-service";
import type { FirstWeekResolverInput } from "../first-week-schemas";

const baseInput: FirstWeekResolverInput = {
  behaviorStats: { bossEngagement: "none", studyUsageRatio: 0 },
  completedSessions: 0,
  daysSinceLastSession: null,
  daysSinceOnboarding: 0,
  featureAvailability: {
    boss: true,
    premium: false,
    social: false,
    study: true,
  },
  motivationStyle: "calm",
  premiumState: "unavailable",
  primaryGoal: "work",
};

type Goal = FirstWeekResolverInput["primaryGoal"];
type Style = FirstWeekResolverInput["motivationStyle"];

describe("Day 1 return copy per lane", () => {
  const cases: Array<{
    goal: Goal;
    style: Style;
    lane: string;
    theme: string;
    msg: string;
    unlock: string;
  }> = [
    {
      goal: "study",
      style: "study_focused",
      lane: "student",
      theme: "study_return",
      msg: "study block",
      unlock: "Study OS",
    },
    {
      goal: "work",
      style: "game_like",
      lane: "game_like",
      theme: "run_return",
      msg: "Run it again",
      unlock: "progress proof",
    },
    {
      goal: "creative",
      style: "coach_led",
      lane: "deep_creative",
      theme: "project_return",
      msg: "project block",
      unlock: "next moves",
    },
    {
      goal: "personal",
      style: "calm",
      lane: "minimal_normal",
      theme: "clean_return",
      msg: "Same clean",
      unlock: "Today Strip",
    },
  ];

  cases.forEach(({ goal, style, lane, theme, msg, unlock }) => {
    it(`Day 1 ${lane} lane-specific copy`, () => {
      const result = resolveFirstWeekExperience({
        ...baseInput,
        completedSessions: 1,
        daysSinceOnboarding: 1,
        primaryGoal: goal,
        motivationStyle: style,
      });
      expect(result.currentDayStage).toBe("DAY_1_RETURN");
      expect(result.lane).toBe(lane);
      expect(result.laneStageTheme).toContain(theme);
      expect(result.primaryMessage).toContain(msg);
      expect(result.unlockExplanation).toContain(unlock);
    });
  });
});

describe("Day 2 proof copy per lane", () => {
  const cases: Array<{
    goal: Goal;
    style: Style;
    lane: string;
    theme: string;
    msg: string;
  }> = [
    {
      goal: "study",
      style: "study_focused",
      lane: "student",
      theme: "study_proof",
      msg: "Two study blocks",
    },
    {
      goal: "work",
      style: "game_like",
      lane: "game_like",
      theme: "run_proof",
      msg: "Two encounters",
    },
    {
      goal: "creative",
      style: "coach_led",
      lane: "deep_creative",
      theme: "project_proof",
      msg: "Two project blocks",
    },
    {
      goal: "personal",
      style: "calm",
      lane: "minimal_normal",
      theme: "clean_proof",
      msg: "Two clean sessions",
    },
  ];

  cases.forEach(({ goal, style, lane, theme, msg }) => {
    it(`Day 2 ${lane} proof copy`, () => {
      const result = resolveFirstWeekExperience({
        ...baseInput,
        completedSessions: 2,
        daysSinceOnboarding: 2,
        primaryGoal: goal,
        motivationStyle: style,
      });
      expect(result.currentDayStage).toBe("DAY_2_PROGRESS_PROOF");
      expect(result.laneStageTheme).toContain(theme);
      expect(result.primaryMessage).toContain(msg);
      expect(result.spotlightSurface).toBe("progress_proof");
    });
  });
});

describe("Day 3 companion/memory per lane", () => {
  const cases: Array<{
    goal: Goal;
    style: Style;
    lane: string;
    theme: string;
  }> = [
    {
      goal: "study",
      style: "study_focused",
      lane: "student",
      theme: "study_companion_preview",
    },
    {
      goal: "work",
      style: "game_like",
      lane: "game_like",
      theme: "run_companion_preview",
    },
    {
      goal: "creative",
      style: "coach_led",
      lane: "deep_creative",
      theme: "project_companion_preview",
    },
    {
      goal: "personal",
      style: "calm",
      lane: "minimal_normal",
      theme: "clean_companion_preview",
    },
  ];

  cases.forEach(({ goal, style, lane, theme }) => {
    it(`Day 3 ${lane} companion grounded in real data`, () => {
      const result = resolveFirstWeekExperience({
        ...baseInput,
        completedSessions: 3,
        daysSinceOnboarding: 3,
        primaryGoal: goal,
        motivationStyle: style,
      });
      expect(result.currentDayStage).toBe("DAY_3_COMPANION_CONNECTION");
      expect(result.laneStageTheme).toContain(theme);
      expect(result.unlockExplanation).toMatch(/real|actual|session/);
      expect(result.allowedHomeSurfaces).toContain("companion_continuity");
    });
  });
});

describe("Day 7 weekly intelligence per lane", () => {
  const cases: Array<{
    goal: Goal;
    style: Style;
    lane: string;
    theme: string;
  }> = [
    {
      goal: "study",
      style: "study_focused",
      lane: "student",
      theme: "study_weekly_intelligence",
    },
    {
      goal: "work",
      style: "game_like",
      lane: "game_like",
      theme: "run_weekly_intelligence",
    },
    {
      goal: "creative",
      style: "coach_led",
      lane: "deep_creative",
      theme: "project_weekly_intelligence",
    },
    {
      goal: "personal",
      style: "calm",
      lane: "minimal_normal",
      theme: "clean_weekly_intelligence",
    },
  ];

  cases.forEach(({ goal, style, lane, theme }) => {
    it(`Day 7 ${lane} weekly intelligence`, () => {
      const result = resolveFirstWeekExperience({
        ...baseInput,
        completedSessions: 7,
        daysSinceOnboarding: 7,
        primaryGoal: goal,
        motivationStyle: style,
      });
      expect(result.currentDayStage).toBe("DAY_7_DEEPER_MODE");
      expect(result.laneStageTheme).toContain(theme);
      expect(result.spotlightSurface).toBe("weekly_insight");
      expect(result.primaryMessage.length).toBeGreaterThan(20);
      expect(result.primaryMessage).toMatch(/week one|first.week|seven/i);
    });
  });

  it("all four lanes have Day 7 copy", () => {
    const lanes: Array<{ goal: Goal; style: Style; lane: string }> = [
      { goal: "study", style: "study_focused", lane: "student" },
      { goal: "work", style: "game_like", lane: "game_like" },
      { goal: "creative", style: "coach_led", lane: "deep_creative" },
      { goal: "personal", style: "calm", lane: "minimal_normal" },
    ];
    for (const { goal, style, lane } of lanes) {
      const result = resolveFirstWeekExperience({
        ...baseInput,
        completedSessions: 7,
        daysSinceOnboarding: 7,
        primaryGoal: goal,
        motivationStyle: style,
      });
      expect(result.primaryMessage).toBeTruthy();
      expect(result.unlockExplanation).toBeTruthy();
      expect(result.lane).toBe(lane);
    }
  });
});
