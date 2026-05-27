/**
 * Risk 1 — Session Component Gating
 * Risk 2 — Coach Memory Depth
 */

import { getFeatureAvailability } from "../../features/liveops-config/feature-access";
import { experience, accessFor } from "./helpers";

describe("Risk 1 — Session component gating", () => {
  it("battle pass component must check FeatureAvailability before rendering", () => {
    const f0 = accessFor(0);
    const bp = getFeatureAvailability(f0.battle_pass);
    expect(bp.canRenderEntryPoint).toBe(false);
    expect(bp.canQuery).toBe(false);

    const f100 = accessFor(100);
    const bp100 = getFeatureAvailability(f100.battle_pass);
    expect(bp100.canRenderEntryPoint).toBe(false);
    expect(bp100.canQuery).toBe(false);
  });

  it("boss combat HUD must check FeatureAvailability before rendering", () => {
    const f0 = accessFor(0);
    const boss = getFeatureAvailability(f0.boss_tab);
    expect(boss.canRenderEntryPoint).toBe(false);
    expect(boss.canQuery).toBe(false);

    const f5 = accessFor(5);
    const boss5 = getFeatureAvailability(f5.boss_tab);
    expect(boss5.canRenderEntryPoint).toBe(true);
    expect(boss5.canQuery).toBe(false);
  });

  it("active session boss combat must check boss_tab before querying hooks", () => {
    const f0 = accessFor(0);
    const boss = getFeatureAvailability(f0.boss_tab);
    expect(boss.canQuery).toBe(false);
    expect(boss.canRenderEntryPoint).toBe(false);

    const f10 = accessFor(10);
    const boss10 = getFeatureAvailability(f10.boss_tab);
    expect(boss10.canQuery).toBe(true);
    expect(boss10.canRenderEntryPoint).toBe(true);
  });

  it("inventory and shop navigation in completion must be gated", () => {
    const f0 = accessFor(0);
    expect(getFeatureAvailability(f0.inventory).canNavigate).toBe(false);
    expect(getFeatureAvailability(f0.shop).canNavigate).toBe(false);

    const f100 = accessFor(100);
    expect(getFeatureAvailability(f100.inventory).canNavigate).toBe(false);
    expect(getFeatureAvailability(f100.shop).canNavigate).toBe(false);
  });
});

describe("Risk 2 — Coach memory depth", () => {
  it("day 0 coach profile does not fabricate memory", () => {
    const exp = experience("coach_led");
    expect(exp.behaviorAdaptations).toContain("needs_more_signal");
    expect(exp.sessionDefaults.copy).toContain("default");
    expect(exp.sessionDefaults.duration).toBe(25);
    expect(exp.progressEmphasis).toBe("basic");
    expect(exp.userStage).toBe("new_user");
    expect(exp.homeSpotlight).toBe("none");
  });

  it("after session 1 coach still has limited signal, no fabricated memory", () => {
    const exp = experience("coach_led", {
      completedSessionDurations: [25],
      totalCompletedSessions: 1,
    });
    expect(exp.behaviorAdaptations).toContain("needs_more_signal");
    expect(exp.sessionDefaults.copy).toContain("default");
  });

  it("after 3+ sessions coach adapts to real data", () => {
    const exp = experience("coach_led", {
      completedSessionDurations: [25, 25, 30],
      totalCompletedSessions: 3,
      mostSuccessfulTimeOfDay: "morning",
    });
    expect(exp.behaviorAdaptations).toContain("duration_pattern");
    expect(exp.behaviorAdaptations).toContain("time_of_day_pattern");
    expect(exp.sessionDefaults.copy).toContain("best rhythm");
  });

  it("coach copy adapts per motivation style", () => {
    expect(
      experience("study_focused", {
        completedSessionDurations: [30, 30, 45],
        studyUsageRatio: 0.7,
        totalCompletedSessions: 5,
      }).coachMessageStyle,
    ).toBe("study_tutor");

    expect(
      experience("intense", {
        completedSessionDurations: [15, 15, 10],
        totalCompletedSessions: 3,
      }).coachTone,
    ).toBe("direct");

    expect(experience("game_like").coachMessageStyle).toBe("game_guide");
    expect(experience("calm").coachMessageStyle).toBe("reflection");
  });
});
