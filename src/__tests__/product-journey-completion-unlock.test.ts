/**
 * Product Journey — Completion + Progressive Unlock + Coach
 */
import {
  experience,
  accessFor,
  getFeatureAvailability,
  assertCoreAvailable,
} from "./debloat-test-helpers";

// ═══ Group 4 — Completion ═══════════════════════════════════════

describe("Group 4 — Completion", () => {
  it("4a: max 4 major beats in completion sequence", () => {
    const exp = experience("coach_led", { totalCompletedSessions: 5 });
    const sequence = exp.completionSequence;
    expect(sequence.length).toBeLessThanOrEqual(6);
    const majorBeats = sequence.filter(
      (s: string) => !["quiet_xp", "next_action"].includes(s),
    );
    expect(majorBeats.length).toBeLessThanOrEqual(4);
  });

  it("4b: calm completion is minimal", () => {
    const exp = experience("calm", { totalCompletedSessions: 3 });
    expect(exp.completionSequence).toContain("core_saved");
    expect(exp.completionSequence).toContain("coach_companion_reflection");
    expect(exp.completionSequence).not.toContain("boss_effect");
  });

  it("4c: study completion shows study next step", () => {
    const exp = experience("study_focused", {
      studyUsageRatio: 0.7,
      totalCompletedSessions: 6,
    });
    expect(exp.completionSequence).toContain("study_progress");
    expect(exp.completionSequence).toContain("next_action");
  });

  it("4d: game-like completion shows boss damage reveal", () => {
    const exp = experience("game_like", {
      bossChallengeEngagement: "high",
      completedSessionDurations: [25, 30, 25],
      totalCompletedSessions: 8,
    });
    expect(exp.completionSequence).toContain("boss_effect");
    expect(exp.boss.completionEffect).toBe("session_damage");
  });

  it("4e: no battle pass in completion", () => {
    const exp = experience("intense", { totalCompletedSessions: 20 });
    expect(exp.completionSequence).not.toContain("battle_pass_reward");
    expect(exp.homeSections).not.toContain("battle_pass");
    expect(exp.hiddenSystems).toContain("battle_pass");
  });

  it("4f: no coins/gems/shop in completion", () => {
    const exp = experience("game_like", { totalCompletedSessions: 15 });
    expect(exp.hiddenSystems).toContain("shop");
    expect(exp.hiddenSystems).toContain("inventory");
    expect(exp.completionSequence).not.toContain("shop_unlock");
    expect(exp.completionSequence).not.toContain("coins_reward");
  });

  it("4g: no rival/squad consequence in completion", () => {
    const exp = experience("game_like", { totalCompletedSessions: 30 });
    expect(exp.completionSequence).not.toContain("rival_result");
    expect(exp.completionSequence).not.toContain("squad_bonus");
    expect(exp.hiddenSystems).toContain("rivals");
    expect(exp.hiddenSystems).toContain("squads");
  });

  it("4h: XP/streak/progress still update", () => {
    const exp = experience("study_focused", {
      completionStreak: 5,
      totalCompletedSessions: 10,
    });
    expect(exp.completionSequence).toContain("core_saved");
    expect(exp.completionSequence).toContain("streak_progress");
    const core = accessFor(10);
    assertCoreAvailable(core, "progress_view");
    expect(getFeatureAvailability(core.economy_basic).canRenderEntryPoint).toBe(
      false,
    );
  });
});

// ═══ Group 5 — Progressive Unlock Runtime ════════════════════════

describe("Group 5 — Progressive Unlock Runtime", () => {
  it("5a: locked features do not query", () => {
    const { HIDDEN_FEATURE_KEYS } = require("./debloat-test-helpers");
    HIDDEN_FEATURE_KEYS.forEach((key: string) => {
      const a = getFeatureAvailability(
        accessFor(0)[key as keyof ReturnType<typeof accessFor>],
      );
      expect(a.canQuery).toBe(false);
    });
    HIDDEN_FEATURE_KEYS.forEach((key: string) => {
      const a = getFeatureAvailability(
        accessFor(999)[key as keyof ReturnType<typeof accessFor>],
      );
      expect(a.canQuery).toBe(false);
    });
  });

  it("5b: locked features do not subscribe", () => {
    const { HIDDEN_FEATURE_KEYS } = require("./debloat-test-helpers");
    HIDDEN_FEATURE_KEYS.forEach((key: string) => {
      const a = getFeatureAvailability(
        accessFor(0)[key as keyof ReturnType<typeof accessFor>],
      );
      expect(a.canSubscribeToEvents).toBe(false);
    });
  });

  it("5c: locked features do not notify", () => {
    const { HIDDEN_FEATURE_KEYS } = require("./debloat-test-helpers");
    HIDDEN_FEATURE_KEYS.forEach((key: string) => {
      const a = getFeatureAvailability(
        accessFor(0)[key as keyof ReturnType<typeof accessFor>],
      );
      expect(a.canShowNotification).toBe(false);
    });
  });

  it("5d: hidden features do not route", () => {
    const { HIDDEN_FEATURE_KEYS } = require("./debloat-test-helpers");
    HIDDEN_FEATURE_KEYS.forEach((key: string) => {
      const a = getFeatureAvailability(
        accessFor(5)[key as keyof ReturnType<typeof accessFor>],
      );
      expect(a.canNavigate).toBe(false);
      expect(a.canRegisterRoute).toBe(false);
    });
  });

  it("5e: hidden features do not render entry points", () => {
    const { HIDDEN_FEATURE_KEYS } = require("./debloat-test-helpers");
    HIDDEN_FEATURE_KEYS.forEach((key: string) => {
      const a = getFeatureAvailability(
        accessFor(0)[key as keyof ReturnType<typeof accessFor>],
      );
      expect(a.canRenderEntryPoint).toBe(false);
    });
  });
});

// ═══ Group 6 — Coach ════════════════════════════════════════════

describe("Group 6 — Coach", () => {
  it("6a: Day 0 coach does not fake memory", () => {
    const exp = experience("coach_led");
    expect(exp.behaviorAdaptations).toContain("needs_more_signal");
    expect(exp.sessionDefaults.copy).toContain("default");
    expect(exp.coachTone).toBe("soft");
  });

  it("6b: after session 1 coach references real session", () => {
    const exp = experience("coach_led", {
      completedSessionDurations: [60],
      totalCompletedSessions: 1,
    });
    expect(exp.behaviorAdaptations).toContain("needs_more_signal");
    expect(exp.sessionDefaults.duration).toBe(25);
    const multi = experience("coach_led", {
      completedSessionDurations: [25, 25, 30, 25],
      totalCompletedSessions: 6,
    });
    expect(multi.behaviorAdaptations).toContain("duration_pattern");
    expect(multi.sessionDefaults.copy).toContain("best rhythm");
  });

  it("6c: coach does not interrupt active focus", () => {
    const exp = experience("calm");
    expect(exp.coachMessageStyle).toBe("reflective_prompt");
    expect(exp.hiddenSystems).toContain("shop");
    expect(exp.completionSequence).not.toContain("coach_interruption");
  });

  it("6d: coach copy adapts by motivation style", () => {
    expect(experience("study_focused").coachMessageStyle).toBe("study_guide");
    expect(experience("intense").coachTone).toBe("direct");
    expect(experience("intense").coachMessageStyle).toBe("direct_tactical");
    expect(experience("game_like").coachMessageStyle).toBe("game_companion");
    expect(experience("calm").coachMessageStyle).toBe("reflective_prompt");
    expect(experience("coach_led").coachMessageStyle).toBe("gentle_mentor");
  });
});
