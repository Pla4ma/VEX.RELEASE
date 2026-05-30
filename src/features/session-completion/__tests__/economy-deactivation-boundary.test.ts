// Helpers must be imported FIRST so jest.mock() calls register before source modules load
import {
  mockOrder,
  mockAddXP,
  baseLedger,
  baseSummary,
  resetEconomyMocks,
} from "./economy-deactivation-helpers";
import { SessionMode } from "../../../session/modes";
import { applyCompletionSubsystems } from "../completion-subsystems";
import { resolveCompletionExperiencePolicy } from "../completion-experience-policy";

describe("Phase 6 — economy deactivation boundary", () => {
  beforeEach(() => {
    resetEconomyMocks();
  });

  it("1. XP/progression still update when economy is deactivated", async () => {
    const result = await applyCompletionSubsystems({
      ledger: baseLedger,
      summary: baseSummary,
    });

    expect(mockAddXP).toHaveBeenCalledTimes(1);
    expect(mockAddXP).toHaveBeenCalledWith(
      baseLedger.xpDelta,
      "SESSION_COMPLETE",
      { sessionId: baseLedger.sessionId },
    );
    expect(result.degradedSystems).not.toContain("progression");
    expect(result.ledger.xpDelta).toBe(120);
  });

  it("2. completion policy hides all economy surfaces", () => {
    const policy = resolveCompletionExperiencePolicy({
      consequences: {},
      featureAvailability: {
        boss: false,
        challenges: false,
        contractUsed: false,
        progress: true,
        study: true,
      },
      firstWeekStage: null,
      motivationStyle: "study_focused",
      premiumState: "free",
      primaryGoal: null,
      sessionMode: SessionMode.FLOW,
      summary: baseSummary,
    });

    expect(policy.hiddenCompletionSurfaces).toContain("battle_pass_card");
    expect(policy.hiddenCompletionSurfaces).toContain("premium_chest");
    expect(policy.hiddenCompletionSurfaces).toContain("coins_gems_wallet");
    expect(policy.hiddenCompletionSurfaces).toContain("shop_inventory_prompts");
    expect(policy.hiddenCompletionSurfaces).toContain("chest_reward_animation");
    expect(policy.hiddenCompletionSurfaces).toContain("multiple_reward_rows");
    expect(policy.hiddenCompletionSurfaces).not.toContain(
      "study_progress_card",
    );
  });

  it("3. reward receipt (subsystems) does not award coins/gems/special/wallet", async () => {
    const result = await applyCompletionSubsystems({
      ledger: baseLedger,
      summary: baseSummary,
    });

    const ledger = result.ledger as Record<string, unknown>;
    expect(ledger.coinsEarned).toBeUndefined();
    expect(ledger.gemsEarned).toBeUndefined();
    expect(ledger.walletDelta).toBeUndefined();
    expect(ledger.specialEarned).toBeUndefined();

    expect(result.ledger.rewardIds.length).toBe(1);
    expect(result.ledger.rewardIds[0]).toMatch(/^session-xp:/);
  });

  it("4. streak record still operates in completion subsystems", async () => {
    await applyCompletionSubsystems({
      ledger: baseLedger,
      summary: baseSummary,
    });

    expect(mockOrder).toContain("streak");
    expect(mockOrder).toContain("progression");
  });

  it("5. completion subsystems execute in correct order: identity → streak → progression → rewards", async () => {
    await applyCompletionSubsystems({
      ledger: baseLedger,
      summary: baseSummary,
    });

    expect(mockOrder).toEqual([
      "focus-identity",
      "streak",
      "progression",
      "rewards",
    ]);
  });
});
