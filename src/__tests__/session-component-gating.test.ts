import { accessFor } from "./debloat-test-helpers";
import { getFeatureAvailability } from "../features/liveops-config/feature-access";

describe("Risk 1 — Session component gating", () => {
  it("battle pass component must check FeatureAvailability before rendering or querying", () => {
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
