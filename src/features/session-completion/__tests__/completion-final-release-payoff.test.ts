import { readFileSync } from "fs";
import path from "path";

import { SessionMode } from "../../../session/modes";
import type { SessionSummary } from "../../../session/types";
import {
  buildCompletionAdaptivePayoff,
  countFinalReleaseCompletionBeats,
} from "../adaptive-payoff-service";
import {
  type CompletionExperiencePolicyInput,
  resolveCompletionExperiencePolicy,
} from "../completion-experience-policy";

const summary: SessionSummary = {
  actualDuration: 1500,
  baseScore: 100,
  bonuses: [],
  coinsEarned: 0,
  completionPercentage: 100,
  createdAt: 500000,
  damage: { totalDamage: 18 },
  damageTaken: 0,
  effectiveDuration: 1400,
  finalScore: 92,
  focusPurityScore: 95,
  focusQuality: 95,
  gemsEarned: 0,
  interruptions: 0,
  modeBonus: 0,
  pausedDuration: 0,
  pausedTime: 0,
  pauses: 0,
  penaltiesApplied: [],
  plannedDuration: 1500,
  sessionId: "session-123",
  sessionMode: SessionMode.FLOW,
  status: "COMPLETED",
  streakBonus: 10,
  streakDays: 4,
  streakIncreased: true,
  streakMaintained: true,
  timeBonus: 10,
  userId: "user-123",
  userLevel: 2,
  vsAverage: 0,
  vsBest: 0,
  xpEarned: 120,
};

const input: CompletionExperiencePolicyInput = {
  consequences: {},
  featureAvailability: {
    boss: true,
    challenges: true,
    contractUsed: false,
    progress: true,
    study: true,
  },
  firstWeekStage: "ACTIVATING",
  motivationStyle: "calm",
  premiumState: "free",
  primaryGoal: null,
  sessionMode: SessionMode.FLOW,
  summary,
};

describe("final-release completion payoff", () => {
  it("renders max 4 major beats", () => {
    const policy = resolveCompletionExperiencePolicy(input);

    expect(countFinalReleaseCompletionBeats(policy)).toBe(4);
  });

  it("normal completion render tree has no chest card or shop callbacks", () => {
    const root = process.cwd();
    const content = readFileSync(
      path.join(
        root,
        "src/screens/session/components/SessionCompleteContent.tsx",
      ),
      "utf8",
    );

    expect(content).not.toMatch(
      /SessionChestCard|SessionPremiumChestCard|SessionPremiumInsightCard|useSessionCompleteChest/,
    );
    expect(content).not.toMatch(/onOpenShop|onOpenInventory/);
  });

  it("all active completion files have zero chest-engine imports", () => {
    const root = process.cwd();
    const completionFiles = [
      "src/screens/session/components/SessionCompleteContent.tsx",
      "src/screens/session/components/SessionCompleteRewardsPhase.tsx",
      "src/screens/session/components/SessionCompletionRewardsSection.tsx",
      "src/features/session-completion/hooks/useSessionCompleteController.ts",
      "src/screens/session/hooks/useSessionCompleteRewards.ts",
      "src/screens/session/hooks/useSessionRewardSync.ts",
      "src/features/session-completion/completion-orchestrator.ts",
      "src/features/session-completion/completion-subsystems.ts",
      "src/features/session-completion/completion-experience-policy.ts",
      "src/features/session-completion/adaptive-payoff-service.ts",
    ];

    for (const file of completionFiles) {
      const source = readFileSync(path.join(root, file), "utf8");
      expect(source).not.toMatch(/from.*chest-engine/);
    }
  });

  it("active completion files have no shop/inventory imports", () => {
    const root = process.cwd();
    const completionFiles = [
      "src/screens/session/components/SessionCompleteContent.tsx",
      "src/screens/session/components/SessionCompleteRewardsPhase.tsx",
      "src/screens/session/components/SessionCompletionRewardsSection.tsx",
      "src/features/session-completion/hooks/useSessionCompleteController.ts",
      "src/screens/session/hooks/useSessionCompleteRewards.ts",
      "src/screens/session/hooks/useSessionRewardSync.ts",
    ];

    for (const file of completionFiles) {
      const source = readFileSync(path.join(root, file), "utf8");
      expect(source).not.toMatch(/from.*\/shop\b|from.*\/inventory\b/);
    }
  });

  it("no active route points to VaultScreen", () => {
    const root = process.cwd();
    const routeRegistry = readFileSync(
      path.join(root, "src/navigation/feature-route-registry.ts"),
      "utf8",
    );
    const vaultInRegistry = /route:\s*'Vault'/.test(routeRegistry);
    expect(vaultInRegistry).toBe(false);
  });

  it("study user gets study payoff", () => {
    const payoff = buildCompletionAdaptivePayoff({
      adaptivePayoff: "study_progress",
      bossDamage: null,
      coachActionLabel: null,
      study: {
        nextTopic: "Review thermodynamics",
        progressLabel: "Lesson plan: 3/8",
        title: "Physics exam plan",
      },
      summary,
    });

    expect(payoff.label).toBe("STUDY PROGRESS");
    expect(payoff.body).toContain("Review thermodynamics");
  });

  it("game-like user gets boss payoff", () => {
    const payoff = buildCompletionAdaptivePayoff({
      adaptivePayoff: "boss_damage",
      bossDamage: 18,
      coachActionLabel: null,
      study: null,
      summary,
    });

    expect(payoff.label).toBe("BOSS DAMAGE");
    expect(payoff.value).toBe("18 damage");
  });

  it("calm user gets progress insight and XP remains visible", () => {
    const payoff = buildCompletionAdaptivePayoff({
      adaptivePayoff: "progress_insight",
      bossDamage: null,
      coachActionLabel: null,
      study: null,
      summary,
    });

    expect(payoff.label).toBe("PROGRESS INSIGHT");
    expect(payoff.value).toBe("+120 focus progress");
  });
});
