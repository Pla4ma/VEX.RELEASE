import {
  resolveFirstWeekExperience,
  resolveLaneCopy,
  decideNudge,
  baseLaneProfile,
  baseStats,
} from "./helpers";
import type { FirstWeekResolverInput, Lane } from "./helpers";

describe("Risk 5 — First-Week Progressive Unlock Staging", () => {
  it("DAY_0: all four modes unique laneStageThemes", () => {
    const themes: Record<Lane, string> = {} as Record<Lane, string>;
    for (const lane of ["student", "game_like", "deep_creative", "minimal_normal"] as const) {
      themes[lane] = resolveLaneCopy("DAY_0_NOT_STARTED", baseLaneProfile({ primaryLane: lane }), "fallback").laneStageTheme;
    }
    expect(themes.student).toBe("first_study_block");
    expect(themes.game_like).toBe("first_focus_run");
    expect(themes.deep_creative).toBe("first_project_block");
    expect(themes.minimal_normal).toBe("first_clean_session");
  });

  it("DAY_1-7: laneStageTheme uses public-facing lane names", () => {
    const pn: Record<Lane, string> = { student: "study", game_like: "run", deep_creative: "project", minimal_normal: "clean" };
    for (const lane of ["student", "game_like", "deep_creative", "minimal_normal"] as const) {
      const profile = baseLaneProfile({ primaryLane: lane });
      const d1 = resolveLaneCopy("DAY_1_RETURN", profile, "fallback");
      expect(d1.laneStageTheme).toBe(`${pn[lane]}_return`);
      const d2 = resolveLaneCopy("DAY_2_PROGRESS_PROOF", profile, "fallback");
      expect(d2.laneStageTheme).toBe(`${pn[lane]}_proof`);
      const d3 = resolveLaneCopy("DAY_3_COMPANION_CONNECTION", profile, "fallback");
      expect(d3.laneStageTheme).toBe(`${pn[lane]}_companion_preview`);
      const d7 = resolveLaneCopy("DAY_7_DEEPER_MODE", profile, "fallback");
      expect(d7.laneStageTheme).toBe(`${pn[lane]}_weekly_intelligence`);
    }
  });

  it("full student progression: all stages correct", () => {
    const stages: string[] = [];
    const profile = baseLaneProfile({ primaryLane: "student" });
    for (const stage of ["DAY_0_NOT_STARTED", "DAY_1_RETURN", "DAY_2_PROGRESS_PROOF", "DAY_3_COMPANION_CONNECTION", "DAY_5_PATH_FORMING", "DAY_7_DEEPER_MODE"] as const) {
      stages.push(`${stage}:${resolveLaneCopy(stage, profile, "fallback").laneStageTheme}`);
    }
    expect(stages).toEqual([
      "DAY_0_NOT_STARTED:first_study_block", "DAY_1_RETURN:study_return",
      "DAY_2_PROGRESS_PROOF:study_proof", "DAY_3_COMPANION_CONNECTION:study_companion_preview",
      "DAY_5_PATH_FORMING:student_path_forming", "DAY_7_DEEPER_MODE:study_weekly_intelligence",
    ]);
  });

  it("resolveFirstWeekExperience stages through all days", () => {
    const base: Partial<FirstWeekResolverInput> = {
      behaviorStats: baseStats, daysSinceLastSession: null,
      featureAvailability: { boss: false, premium: false, social: false, study: true },
      motivationStyle: "study_focused", premiumState: "unavailable", primaryGoal: "study",
      laneProfile: baseLaneProfile({ primaryLane: "student" }),
    };
    const day0 = resolveFirstWeekExperience({ ...base, completedSessions: 0, daysSinceOnboarding: 0 } as FirstWeekResolverInput);
    expect(day0.currentDayStage).toBe("DAY_0_NOT_STARTED");
    const day3 = resolveFirstWeekExperience({ ...base, completedSessions: 3, daysSinceOnboarding: 3 } as FirstWeekResolverInput);
    expect(day3.currentDayStage).toBe("DAY_3_COMPANION_CONNECTION");
    const day7 = resolveFirstWeekExperience({ ...base, completedSessions: 7, daysSinceOnboarding: 7 } as FirstWeekResolverInput);
    expect(day7.currentDayStage).toBe("DAY_7_DEEPER_MODE");
    const post = resolveFirstWeekExperience({ ...base, completedSessions: 10, daysSinceOnboarding: 14 } as FirstWeekResolverInput);
    expect(post.currentDayStage).toBe("POST_DAY_7");
  });

  it("Clean end-to-end: max 1 notif, no boss", () => {
    const day0 = resolveFirstWeekExperience({
      behaviorStats: baseStats, completedSessions: 0, daysSinceLastSession: null, daysSinceOnboarding: 0,
      featureAvailability: { boss: false, premium: false, social: false, study: false },
      motivationStyle: "calm", premiumState: "unavailable", primaryGoal: "work",
      laneProfile: baseLaneProfile({ primaryLane: "minimal_normal" }),
    });
    expect(day0.allowedHomeSurfaces).not.toContain("tiny_boss_teaser");
    const nudge = decideNudge({ lane: "minimal_normal", completedSessions: 3, daysSinceOnboarding: 3, sentToday: 1 });
    expect(nudge.allowed).toBe(false);
  });

  it("comeback state progression: none → missed_1 → missed_week → long_gap", () => {
    const base: Partial<FirstWeekResolverInput> = {
      behaviorStats: baseStats, featureAvailability: { boss: false, premium: false, social: false, study: true },
      motivationStyle: "coach_led", premiumState: "unavailable", primaryGoal: "work",
      completedSessions: 0, daysSinceOnboarding: 0,
    };
    expect(resolveFirstWeekExperience({ ...base, daysSinceLastSession: 0 } as FirstWeekResolverInput).comebackState).toBe("none");
    expect(resolveFirstWeekExperience({ ...base, daysSinceLastSession: 2 } as FirstWeekResolverInput).comebackState).toBe("missed_1_day");
    expect(resolveFirstWeekExperience({ ...base, daysSinceLastSession: 7 } as FirstWeekResolverInput).comebackState).toBe("missed_week");
    expect(resolveFirstWeekExperience({ ...base, daysSinceLastSession: 30 } as FirstWeekResolverInput).comebackState).toBe("returning_after_long_gap");
  });

  it("final release: economy surfaces permanently hidden", () => {
    for (const sessions of [0, 3, 7, 10]) {
      const result = resolveFirstWeekExperience({
        behaviorStats: baseStats, completedSessions: sessions, daysSinceLastSession: null, daysSinceOnboarding: sessions,
        featureAvailability: { boss: true, premium: true, social: true, study: true },
        motivationStyle: "coach_led", premiumState: "configured", primaryGoal: "work",
      });
      const blocked = ["shop", "inventory", "battle_pass", "wagers", "rivals", "squads", "leaderboards", "premium_currency", "premium_hard_sell", "advanced_economy"];
      for (const b of blocked) {
        expect(result.hiddenSurfaces).toContain(b as (typeof result.hiddenSurfaces)[number]);
      }
    }
  });
});
