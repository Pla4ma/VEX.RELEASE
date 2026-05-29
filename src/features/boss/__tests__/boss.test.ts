/**
 * Tests for the boss feature
 * Covers: types, schemas, repository, service, display-policy,
 *         boss-engagement-signals, analytics, hooks, components
 */

// ── Types & Schemas ────────────────────────────────────────────────

import {
  PersonalBlockerBlockSchema,
  PersonalBossBlockSchema,
} from "../types";
import type {
  PersonalBlockerBlock,
  BlockerVisibility,
  BlockerCompletionSignal,
} from "../types";
import {
  BossRewardTypeSchema,
  BossEncounterStatusSchema,
  BossTemplateSchema,
  BossEncounterSummarySchema,
} from "../schemas";

describe("PersonalBlockerBlockSchema", () => {
  it("validates a valid blocker block", () => {
    const result = PersonalBlockerBlockSchema.parse({
      id: "blocker-1",
      label: "Procrastination",
      triggerAfterSessions: 3,
    });
    expect(result.id).toBe("blocker-1");
    expect(result.label).toBe("Procrastination");
    expect(result.triggerAfterSessions).toBe(3);
  });

  it("accepts optional motivationStyle", () => {
    const result = PersonalBlockerBlockSchema.parse({
      id: "b2",
      label: "Distraction",
      triggerAfterSessions: 0,
      motivationStyle: "calm",
    });
    expect(result.motivationStyle).toBe("calm");
  });

  it.each(["calm", "study", "game_like", "intense"])(
    "accepts motivationStyle '%s'",
    (style) => {
      const result = PersonalBlockerBlockSchema.parse({
        id: "b",
        label: "L",
        triggerAfterSessions: 1,
        motivationStyle: style,
      });
      expect(result.motivationStyle).toBe(style);
    },
  );

  it("rejects invalid motivationStyle", () => {
    expect(() =>
      PersonalBlockerBlockSchema.parse({
        id: "b",
        label: "L",
        triggerAfterSessions: 1,
        motivationStyle: "invalid",
      }),
    ).toThrow();
  });

  it("rejects negative triggerAfterSessions", () => {
    expect(() =>
      PersonalBlockerBlockSchema.parse({
        id: "b",
        label: "L",
        triggerAfterSessions: -1,
      }),
    ).toThrow();
  });

  it("rejects non-integer triggerAfterSessions", () => {
    expect(() =>
      PersonalBlockerBlockSchema.parse({
        id: "b",
        label: "L",
        triggerAfterSessions: 1.5,
      }),
    ).toThrow();
  });
});

describe("PersonalBossBlockSchema (legacy alias)", () => {
  it("is the same schema as PersonalBlockerBlockSchema", () => {
    expect(PersonalBossBlockSchema).toBe(PersonalBlockerBlockSchema);
  });
});

describe("boss schemas (legacy)", () => {
  it("BossRewardTypeSchema accepts XP", () => {
    expect(BossRewardTypeSchema.parse("XP")).toBe("XP");
  });

  it("BossEncounterStatusSchema accepts ACTIVE", () => {
    expect(BossEncounterStatusSchema.parse("ACTIVE")).toBe("ACTIVE");
  });

  it("BossTemplateSchema parses partial object", () => {
    const result = BossTemplateSchema.parse({ id: "t1" });
    expect(result.id).toBe("t1");
  });

  it("BossEncounterSummarySchema parses empty object", () => {
    const result = BossEncounterSummarySchema.parse({});
    expect(result).toEqual({});
  });
});

// ── Repository ─────────────────────────────────────────────────────

import { bossRepository } from "../repository";
import {
  fetchBossTemplate,
  fetchActiveEncounter,
  hasActiveBossEncounter,
  getBossEncounter,
} from "../repository";

describe("bossRepository", () => {
  it("exports all methods", () => {
    expect(typeof bossRepository.fetchBossTemplate).toBe("function");
    expect(typeof bossRepository.fetchActiveEncounter).toBe("function");
    expect(typeof bossRepository.hasActiveBossEncounter).toBe("function");
    expect(typeof bossRepository.getBossEncounter).toBe("function");
  });

  it("fetchBossTemplate returns null", async () => {
    const result = await fetchBossTemplate();
    expect(result).toBeNull();
  });

  it("fetchActiveEncounter returns null", async () => {
    const result = await fetchActiveEncounter();
    expect(result).toBeNull();
  });

  it("hasActiveBossEncounter returns false", async () => {
    const result = await hasActiveBossEncounter();
    expect(result).toBe(false);
  });

  it("getBossEncounter returns null", async () => {
    const result = await getBossEncounter();
    expect(result).toBeNull();
  });
});

// ── Service ────────────────────────────────────────────────────────

import {
  calculateDamage,
  createEncounter,
  applyDamage,
  getActiveEncounter,
  getAvailableBosses,
  canUserFightBoss,
  consumeBountiesOnDamage,
  recordBountyLootBoost,
} from "../service";

describe("boss service", () => {
  it("calculateDamage returns 0", () => {
    expect(calculateDamage()).toBe(0);
  });

  it("createEncounter resolves to null", async () => {
    await expect(createEncounter()).resolves.toBeNull();
  });

  it("applyDamage resolves to null", async () => {
    await expect(
      applyDamage({ encounterId: "e1", sessionId: "s1", damage: 10 }),
    ).resolves.toBeNull();
  });

  it("applyDamage works with no arguments", async () => {
    await expect(applyDamage()).resolves.toBeNull();
  });

  it("getActiveEncounter resolves to null", async () => {
    await expect(getActiveEncounter("user-1")).resolves.toBeNull();
  });

  it("getAvailableBosses resolves to empty array", async () => {
    await expect(getAvailableBosses()).resolves.toEqual([]);
  });

  it("canUserFightBoss returns not allowed with 'archived' reason", async () => {
    const result = await canUserFightBoss();
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("archived");
  });

  it("consumeBountiesOnDamage is a no-op", () => {
    expect(() => consumeBountiesOnDamage()).not.toThrow();
  });

  it("recordBountyLootBoost is a no-op", () => {
    expect(() => recordBountyLootBoost()).not.toThrow();
  });
});

// ── Display Policy ─────────────────────────────────────────────────

import {
  shouldShowBossPreview,
  isCombatAllowed,
  isBossVisibleAtSurface,
  useBossDisplayPolicy,
  getBossDisplayCopy,
  isBossVisibleAtHome,
} from "../display-policy";

describe("display-policy", () => {
  it("shouldShowBossPreview returns false", () => {
    expect(shouldShowBossPreview()).toBe(false);
  });

  it("isCombatAllowed returns false", () => {
    expect(isCombatAllowed()).toBe(false);
  });

  it("isCombatAllowed ignores policy argument", () => {
    expect(isCombatAllowed({ some: "policy" })).toBe(false);
  });

  it("isBossVisibleAtSurface returns false", () => {
    expect(isBossVisibleAtSurface()).toBe(false);
  });

  it("useBossDisplayPolicy returns not visible and combat not allowed", () => {
    const policy = useBossDisplayPolicy();
    expect(policy.isVisible).toBe(false);
    expect(policy.combatAllowed).toBe(false);
  });

  it("useBossDisplayPolicy ignores context argument", () => {
    const policy = useBossDisplayPolicy("home");
    expect(policy.isVisible).toBe(false);
    expect(policy.combatAllowed).toBe(false);
  });

  it("getBossDisplayCopy returns empty title and subtitle", () => {
    const copy = getBossDisplayCopy();
    expect(copy.title).toBe("");
    expect(copy.subtitle).toBe("");
  });

  it("isBossVisibleAtHome is false", () => {
    expect(isBossVisibleAtHome).toBe(false);
  });
});

// ── Boss Engagement Signals ────────────────────────────────────────

import {
  getBossEngagementSignals,
  useBossEngagementSignals,
  deriveBossEngagementLevel,
} from "../boss-engagement-signals";
import type { BossEngagementInputs } from "../boss-engagement-signals";

describe("boss-engagement-signals", () => {
  const emptyInputs: BossEngagementInputs = {};

  it("getBossEngagementSignals returns empty array", () => {
    expect(getBossEngagementSignals(emptyInputs)).toEqual([]);
  });

  it("getBossEngagementSignals handles populated inputs", () => {
    const inputs: BossEngagementInputs = {
      bossIgnored: false,
      bossUnlocked: true,
      canQueryBoss: true,
      bossRouteOpenedCount: 5,
      bossCTAClickedCount: 3,
      bossDamageEventsCount: 10,
      recentSessionsWithBossProgress: 2,
    };
    expect(getBossEngagementSignals(inputs)).toEqual([]);
  });

  it("useBossEngagementSignals returns inputs with empty signals", () => {
    const inputs: BossEngagementInputs = { bossUnlocked: true };
    const result = useBossEngagementSignals(inputs);
    expect(result.signals).toEqual([]);
    expect(result.bossUnlocked).toBe(true);
  });

  it("deriveBossEngagementLevel returns 'none'", () => {
    expect(deriveBossEngagementLevel(emptyInputs)).toBe("none");
  });

  it("deriveBossEngagementLevel returns 'none' with high activity", () => {
    const inputs: BossEngagementInputs = {
      bossRouteOpenedCount: 100,
      bossCTAClickedCount: 50,
      bossDamageEventsCount: 200,
    };
    expect(deriveBossEngagementLevel(inputs)).toBe("none");
  });
});

// ── Analytics ──────────────────────────────────────────────────────

import {
  BOSS_ANALYTICS_EVENTS,
  trackBossEvent,
  trackBossRouteOpened,
  trackBossCTAClicked,
  trackCombatAbilityActivated,
} from "../analytics";

describe("boss analytics", () => {
  it("BOSS_ANALYTICS_EVENTS is an empty array", () => {
    expect(BOSS_ANALYTICS_EVENTS).toEqual([]);
  });

  it("trackBossEvent is a no-op function", () => {
    expect(() => trackBossEvent()).not.toThrow();
  });

  it("trackBossRouteOpened accepts all args", () => {
    expect(() => trackBossRouteOpened("user-1", "high", true)).not.toThrow();
  });

  it("trackBossRouteOpened works with no args", () => {
    expect(() => trackBossRouteOpened()).not.toThrow();
  });

  it("trackBossCTAClicked accepts all args", () => {
    expect(() => trackBossCTAClicked("user-1", 25, "intense")).not.toThrow();
  });

  it("trackCombatAbilityActivated accepts all args", () => {
    expect(() =>
      trackCombatAbilityActivated("u1", "e1", "fireball", 50, true),
    ).not.toThrow();
  });
});

// ── Hooks ──────────────────────────────────────────────────────────

import { useActiveBoss, useBossEngagementSummary, useAvailableBosses, useBossTemplates } from "../hooks/index";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { renderHook, waitFor } from "@testing-library/react-native";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children,
    );
  };
}

describe("useActiveBoss", () => {
  it("returns null data (archived)", async () => {
    const { result } = renderHook(() => useActiveBoss(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });
});

describe("useBossEngagementSummary", () => {
  it("returns zeroed engagement data", async () => {
    const { result } = renderHook(() => useBossEngagementSummary(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({
      bossRouteOpenedCount: 0,
      bossCTAClickedCount: 0,
      bossDamageEventsCount: 0,
      recentSessionsWithBossProgress: 0,
    });
  });
});

describe("useAvailableBosses", () => {
  it("returns empty array", async () => {
    const { result } = renderHook(() => useAvailableBosses(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });
});

describe("useBossTemplates", () => {
  it("returns empty array", async () => {
    const { result } = renderHook(() => useBossTemplates(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });
});

// ── Component: BossBattleHUD ───────────────────────────────────────

import { BossBattleHUD } from "../components/boss-battle-hud";
import { render } from "@testing-library/react-native";

describe("BossBattleHUD", () => {
  it("renders the archived message", () => {
    const { getByText } = render(React.createElement(BossBattleHUD));
    expect(getByText(/Boss battles have been moved/i)).toBeTruthy();
  });

  it("has accessibility label", () => {
    const { getByLabelText } = render(React.createElement(BossBattleHUD));
    expect(getByLabelText("Boss battle")).toBeTruthy();
  });
});

// ── Index exports ──────────────────────────────────────────────────

import * as bossIndex from "../index";

describe("boss index exports", () => {
  it("exports shouldShowBossPreview", () => {
    expect(typeof bossIndex.shouldShowBossPreview).toBe("function");
  });

  it("exports isBossVisibleAtSurface", () => {
    expect(typeof bossIndex.isBossVisibleAtSurface).toBe("function");
  });

  it("exports isCombatAllowed", () => {
    expect(typeof bossIndex.isCombatAllowed).toBe("function");
  });

  it("exports getBossDisplayCopy", () => {
    expect(typeof bossIndex.getBossDisplayCopy).toBe("function");
  });

  it("exports bossRepository", () => {
    expect(bossIndex.bossRepository).toBeDefined();
  });

  it("exports getBossEngagementSignals", () => {
    expect(typeof bossIndex.getBossEngagementSignals).toBe("function");
  });

  it("exports deriveBossEngagementLevel", () => {
    expect(typeof bossIndex.deriveBossEngagementLevel).toBe("function");
  });

  it("exports trackBossEvent", () => {
    expect(typeof bossIndex.trackBossEvent).toBe("function");
  });

  it("exports trackBossRouteOpened", () => {
    expect(typeof bossIndex.trackBossRouteOpened).toBe("function");
  });

  it("exports trackBossCTAClicked", () => {
    expect(typeof bossIndex.trackBossCTAClicked).toBe("function");
  });
});

// ── Hook exports from hooks/useActiveBoss.ts ───────────────────────

import {
  useActiveBossEnhanced,
} from "../hooks/useActiveBoss";

describe("hooks/useActiveBoss exports", () => {
  it("useActiveBossEnhanced is a function", () => {
    expect(typeof useActiveBossEnhanced).toBe("function");
  });
});

// ── Hook exports from hooks/useBossEngagementSummary.ts ────────────

import {
  useBossEngagementSummaryForCoach,
  useBossEngagementSummary as useBossEngagementSummaryAlias,
} from "../hooks/useBossEngagementSummary";

describe("hooks/useBossEngagementSummary", () => {
  it("useBossEngagementSummaryForCoach is disabled when userId is null", async () => {
    const { result } = renderHook(
      () => useBossEngagementSummaryForCoach(null),
      { wrapper: createWrapper() },
    );
    // Should not be fetching since userId is null
    expect(result.current.isFetching).toBe(false);
  });

  it("useBossEngagementSummaryForCoach fetches when userId provided", async () => {
    const { result } = renderHook(
      () => useBossEngagementSummaryForCoach("user-1"),
      { wrapper: createWrapper() },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({
      bossRouteOpenedCount: 0,
      bossCTAClickedCount: 0,
      bossDamageEventsCount: 0,
      recentSessionsWithBossProgress: 0,
    });
  });

  it("useBossEngagementSummary is an alias", () => {
    expect(useBossEngagementSummaryAlias).toBe(useBossEngagementSummaryForCoach);
  });
});
