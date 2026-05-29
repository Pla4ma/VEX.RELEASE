/**
 * Test Group 3 — Active Session
 * Test Group 4 — Completion
 */

import { getFeatureAvailability } from "../../features/liveops-config/feature-access";
import {
  experience,
  firstWeek,
  accessFor,
  assertCoreAvailable,
} from "./helpers";

describe("Group 3 — Active Session", () => {
  it("3a: calm user sees timer/progress only", () => {
    const exp = experience("calm");
    expect(exp.bossIntensity).toBe("subtle");
    expect(exp.homeLayoutVariant).not.toBe("game_centered");
    expect(exp.bannedSurfaces).toContain("boss_combat_effects");
  });

  it("3b: study user sees study target in active session", () => {
    const exp = experience("study_focused");
    expect(exp.studyLayerProminence).toBe("spotlight");
    expect(exp.studyLayerLabel).toBe("Study OS");
  });

  it("3c: game-like user sees tiny boss indicator only by default", () => {
    const exp = experience("game_like");
    expect(exp.boss.isVisible).toBe(false);
    expect(exp.boss.dayZeroTeaserAllowed).toBe(false);
    expect(exp.boss.homePlacement).toBe("hidden");

    const fw = firstWeek({
      motivationStyle: "game_like",
      featureAvailability: {
        boss: true,
        premium: false,
        social: false,
        study: true,
      },
    });
    expect(fw.allowedHomeSurfaces).not.toContain("boss_full");
    expect(fw.bossIntensity).toBe("tiny_tease");
  });

  it("3d: no full BossCombatHUD by default for calm/study users", () => {
    const expCalm = experience("calm");
    expect(expCalm.homeSections).not.toContain("boss_full_cta");
    expect(expCalm.bannedSurfaces).toContain("boss_full_cta");

    const expStudy = experience("study_focused");
    expect(expStudy.bannedSurfaces).toContain("boss_full_cta");
  });

  it("3e: no coach loading spinner during focus", () => {
    const exp = experience("coach_led");
    expect(exp.coachMessageStyle).toBe("gentle_mentor");
    expect(exp.coachTone).toBe("soft");
    expect(exp.bannedSurfaces).not.toContain("coach_presence");
  });

  it("3f: no purity score stress by default", () => {
    const exp = experience("intense");
    expect(exp.homeSections).not.toContain("purity_display");
    expect(exp.bannedSurfaces).not.toContain("purity_score");

    const expCalm = experience("calm");
    expect(expCalm.homeSections).not.toContain("purity_display");
  });
});

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
