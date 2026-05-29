/**
 * Comprehensive tests for the boss feature
 * Covers: types, schemas, service, repository, display-policy,
 * boss-engagement-signals, analytics, hooks, index exports
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
  it("parses a valid blocker block with all required fields", () => {
    const result = PersonalBlockerBlockSchema.parse({
      id: "blocker-1",
      label: "Procrastination",
      triggerAfterSessions: 3,
    });
    expect(result.id).toBe("blocker-1");
    expect(result.label).toBe("Procrastination");
    expect(result.triggerAfterSessions).toBe(3);
  });

  it("accepts all valid motivationStyle values", () => {
    const styles = ["calm", "study", "game_like", "intense"] as const;
    for (const style of styles) {
      const result = PersonalBlockerBlockSchema.parse({
        id: "b",
        label: "L",
        triggerAfterSessions: 1,
        motivationStyle: style,
      });
      expect(result.motivationStyle).toBe(style);
    }
  });

  it("works without motivationStyle (optional field)", () => {
    const result = PersonalBlockerBlockSchema.parse({
      id: "b2",
      label: "Distraction",
      triggerAfterSessions: 0,
    });
    expect(result.motivationStyle).toBeUndefined();
  });

  it("rejects invalid motivationStyle value", () => {
    expect(() =>
      PersonalBlockerBlockSchema.parse({
        id: "b",
        label: "L",
        triggerAfterSessions: 1,
        motivationStyle: "invalid_style",
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

  it("accepts triggerAfterSessions of 0", () => {
    const result = PersonalBlockerBlockSchema.parse({
      id: "b",
      label: "L",
      triggerAfterSessions: 0,
    });
    expect(result.triggerAfterSessions).toBe(0);
  });

  it("accepts large triggerAfterSessions values", () => {
    const result = PersonalBlockerBlockSchema.parse({
      id: "b",
      label: "L",
      triggerAfterSessions: 9999,
    });
    expect(result.triggerAfterSessions).toBe(9999);
  });
});

describe("PersonalBossBlockSchema (legacy alias)", () => {
  it("is the exact same object reference as PersonalBlockerBlockSchema", () => {
    expect(PersonalBossBlockSchema).toBe(PersonalBlockerBlockSchema);
  });

  it("validates the same data identically", () => {
    const data = { id: "b", label: "Test", triggerAfterSessions: 5 };
    expect(PersonalBossBlockSchema.parse(data)).toEqual(
      PersonalBlockerBlockSchema.parse(data),
    );
  });
});

describe("Type compatibility", () => {
  it("PersonalBlockerBlock type matches schema output", () => {
    const block: PersonalBlockerBlock = {
      id: "test",
      label: "Test",
      triggerAfterSessions: 1,
    };
    expect(block.id).toBe("test");
  });

  it("BlockerVisibility type accepts all expected values", () => {
    const visibilities: BlockerVisibility[] = [
      "hidden",
      "teaser",
      "subtle",
      "visible",
    ];
    expect(visibilities).toHaveLength(4);
  });

  it("BlockerCompletionSignal has the expected shape", () => {
    const signal: BlockerCompletionSignal = {
      blockerId: "b1",
      progressSaved: 0.5,
      resolved: true,
    };
    expect(signal.blockerId).toBe("b1");
    expect(signal.progressSaved).toBe(0.5);
    expect(signal.resolved).toBe(true);
  });
});

// ── Legacy Schemas ─────────────────────────────────────────────────

describe("Legacy boss schemas", () => {
  it("BossRewardTypeSchema accepts only 'XP'", () => {
    expect(BossRewardTypeSchema.parse("XP")).toBe("XP");
    expect(() => BossRewardTypeSchema.parse("GOLD")).toThrow();
  });

  it("BossEncounterStatusSchema accepts only 'ACTIVE'", () => {
    expect(BossEncounterStatusSchema.parse("ACTIVE")).toBe("ACTIVE");
    expect(() => BossEncounterStatusSchema.parse("COMPLETED")).toThrow();
  });

  it("BossTemplateSchema parses partial objects with any combination of fields", () => {
    expect(BossTemplateSchema.parse({ id: "t1" }).id).toBe("t1");
    expect(BossTemplateSchema.parse({ name: "Dragon" }).name).toBe("Dragon");
    expect(BossTemplateSchema.parse({ tier: 3 }).tier).toBe(3);
    expect(BossTemplateSchema.parse({}).id).toBeUndefined();
  });

  it("BossEncounterSummarySchema parses empty object", () => {
    expect(BossEncounterSummarySchema.parse({})).toEqual({});
  });

  it("BossEncounterSummarySchema strips unknown keys (strict partial)", () => {
    const result = BossEncounterSummarySchema.parse({ extra: "field" });
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

describe("bossRepository object", () => {
  it("exports all 4 required methods", () => {
    expect(typeof bossRepository.fetchBossTemplate).toBe("function");
    expect(typeof bossRepository.fetchActiveEncounter).toBe("function");
    expect(typeof bossRepository.hasActiveBossEncounter).toBe("function");
    expect(typeof bossRepository.getBossEncounter).toBe("function");
  });

  it("methods match the standalone named exports", () => {
    expect(bossRepository.fetchBossTemplate).toBe(fetchBossTemplate);
    expect(bossRepository.fetchActiveEncounter).toBe(fetchActiveEncounter);
    expect(bossRepository.hasActiveBossEncounter).toBe(hasActiveBossEncounter);
    expect(bossRepository.getBossEncounter).toBe(getBossEncounter);
  });
});

describe("Repository stubs (archived feature)", () => {
  it("fetchBossTemplate resolves to null", async () => {
    await expect(fetchBossTemplate()).resolves.toBeNull();
  });

  it("fetchBossTemplate accepts any arguments", async () => {
    await expect(fetchBossTemplate("arg1", "arg2")).resolves.toBeNull();
  });

  it("fetchActiveEncounter resolves to null", async () => {
    await expect(fetchActiveEncounter()).resolves.toBeNull();
  });

  it("hasActiveBossEncounter resolves to false", async () => {
    await expect(hasActiveBossEncounter()).resolves.toBe(false);
  });

  it("getBossEncounter resolves to null", async () => {
    await expect(getBossEncounter()).resolves.toBeNull();
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

describe("Service stubs (archived feature)", () => {
  it("calculateDamage returns 0 synchronously", () => {
    expect(calculateDamage()).toBe(0);
    expect(typeof calculateDamage()).toBe("number");
  });

  it("createEncounter returns a Promise resolving to null", async () => {
    const result = createEncounter();
    expect(result).toBeInstanceOf(Promise);
    await expect(result).resolves.toBeNull();
  });

  it("applyDamage resolves to null with input", async () => {
    await expect(
      applyDamage({ encounterId: "e1", sessionId: "s1", damage: 10 }),
    ).resolves.toBeNull();
  });

  it("applyDamage resolves to null with no arguments", async () => {
    await expect(applyDamage()).resolves.toBeNull();
  });

  it("getActiveEncounter resolves to null for any userId", async () => {
    await expect(getActiveEncounter("user-1")).resolves.toBeNull();
    await expect(getActiveEncounter("")).resolves.toBeNull();
  });

  it("getAvailableBosses resolves to an empty array", async () => {
    const result = await getAvailableBosses();
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
  });

  it("canUserFightBoss returns {allowed:false, reason:'archived'}", async () => {
    const result = await canUserFightBoss();
    expect(result).toEqual({ allowed: false, reason: "archived" });
  });

  it("consumeBountiesOnDamage is a no-op (no throw)", () => {
    expect(() => consumeBountiesOnDamage()).not.toThrow();
    expect(consumeBountiesOnDamage()).toBeUndefined();
  });

  it("recordBountyLootBoost is a no-op (no throw)", () => {
    expect(() => recordBountyLootBoost()).not.toThrow();
    expect(recordBountyLootBoost()).toBeUndefined();
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

describe("Display policy (all stubs return false/empty)", () => {
  it("shouldShowBossPreview always returns false", () => {
    expect(shouldShowBossPreview()).toBe(false);
  });

  it("isCombatAllowed always returns false regardless of argument", () => {
    expect(isCombatAllowed()).toBe(false);
    expect(isCombatAllowed(undefined)).toBe(false);
    expect(isCombatAllowed({ some: "policy" })).toBe(false);
  });

  it("isBossVisibleAtSurface always returns false", () => {
    expect(isBossVisibleAtSurface()).toBe(false);
    expect(isBossVisibleAtSurface("home")).toBe(false);
  });

  it("useBossDisplayPolicy returns hidden and no combat", () => {
    const policy = useBossDisplayPolicy();
    expect(policy).toEqual({ isVisible: false, combatAllowed: false });
  });

  it("useBossDisplayPolicy returns same result with context argument", () => {
    expect(useBossDisplayPolicy("home")).toEqual({
      isVisible: false,
      combatAllowed: false,
    });
    expect(useBossDisplayPolicy("session")).toEqual({
      isVisible: false,
      combatAllowed: false,
    });
  });

  it("getBossDisplayCopy returns empty strings for title and subtitle", () => {
    const copy = getBossDisplayCopy();
    expect(copy).toHaveProperty("title");
    expect(copy).toHaveProperty("subtitle");
    expect(copy.title).toBe("");
    expect(copy.subtitle).toBe("");
  });

  it("isBossVisibleAtHome is a boolean constant set to false", () => {
    expect(isBossVisibleAtHome).toBe(false);
    expect(typeof isBossVisibleAtHome).toBe("boolean");
  });
});

// ── Boss Engagement Signals ────────────────────────────────────────

import {
  getBossEngagementSignals,
  useBossEngagementSignals,
  deriveBossEngagementLevel,
} from "../boss-engagement-signals";
import type {
  BossEngagementInputs,
  BossEngagementSignal,
  BossEngagementLevel,
} from "../boss-engagement-signals";

describe("Boss engagement signals", () => {
  it("getBossEngagementSignals always returns empty array", () => {
    expect(getBossEngagementSignals({})).toEqual([]);
    expect(
      getBossEngagementSignals({
        bossUnlocked: true,
        bossRouteOpenedCount: 10,
      }),
    ).toEqual([]);
  });

  it("useBossEngagementSignals returns inputs merged with empty signals", () => {
    const inputs: BossEngagementInputs = {
      bossUnlocked: true,
      canQueryBoss: true,
      bossRouteOpenedCount: 5,
    };
    const result = useBossEngagementSignals(inputs);
    expect(result.signals).toEqual([]);
    expect(result.bossUnlocked).toBe(true);
    expect(result.canQueryBoss).toBe(true);
    expect(result.bossRouteOpenedCount).toBe(5);
  });

  it("useBossEngagementSignals works with empty inputs", () => {
    const result = useBossEngagementSignals({});
    expect(result.signals).toEqual([]);
  });

  it("deriveBossEngagementLevel always returns 'none'", () => {
    expect(deriveBossEngagementLevel({})).toBe("none");
    expect(
      deriveBossEngagementLevel({
        bossRouteOpenedCount: 100,
        bossDamageEventsCount: 50,
      }),
    ).toBe("none");
  });

  it("BossEngagementSignal has type and value", () => {
    const signal: BossEngagementSignal = { type: "test", value: 42 };
    expect(signal.type).toBe("test");
    expect(signal.value).toBe(42);
  });

  it("BossEngagementLevel type includes all expected values", () => {
    const levels: BossEngagementLevel[] = [
      "none",
      "low",
      "medium",
      "high",
    ];
    expect(levels).toHaveLength(4);
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

describe("Boss analytics (all stubs)", () => {
  it("BOSS_ANALYTICS_EVENTS is an empty readonly array", () => {
    expect(BOSS_ANALYTICS_EVENTS).toEqual([]);
    expect(Array.isArray(BOSS_ANALYTICS_EVENTS)).toBe(true);
  });

  it("trackBossEvent is a void function", () => {
    expect(trackBossEvent()).toBeUndefined();
  });

  it("trackBossRouteOpened accepts all arg combinations", () => {
    expect(() => trackBossRouteOpened()).not.toThrow();
    expect(() => trackBossRouteOpened("user-1")).not.toThrow();
    expect(() => trackBossRouteOpened("user-1", "high")).not.toThrow();
    expect(() => trackBossRouteOpened("user-1", "high", true)).not.toThrow();
    expect(() => trackBossRouteOpened(null, undefined, false)).not.toThrow();
  });

  it("trackBossCTAClicked accepts all arg combinations", () => {
    expect(() => trackBossCTAClicked()).not.toThrow();
    expect(() => trackBossCTAClicked("user-1")).not.toThrow();
    expect(() => trackBossCTAClicked("user-1", 25, "intense")).not.toThrow();
  });

  it("trackCombatAbilityActivated accepts all arg combinations", () => {
    expect(() => trackCombatAbilityActivated()).not.toThrow();
    expect(() =>
      trackCombatAbilityActivated("u1", "e1", "fireball", 50, true),
    ).not.toThrow();
  });
});

// ── Hooks ──────────────────────────────────────────────────────────

import {
  useActiveBoss,
  useBossEngagementSummary,
  useAvailableBosses,
  useBossTemplates,
} from "../hooks/index";
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

describe("useActiveBoss hook", () => {
  it("resolves to null data (archived feature)", async () => {
    const { result } = renderHook(() => useActiveBoss(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });

  it("accepts variadic arguments without error", async () => {
    const { result } = renderHook(() => useActiveBoss("arg1"), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });
});

describe("useBossEngagementSummary hook", () => {
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

describe("useAvailableBosses hook", () => {
  it("returns empty array (archived)", async () => {
    const { result } = renderHook(() => useAvailableBosses(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });
});

describe("useBossTemplates hook", () => {
  it("returns empty array", async () => {
    const { result } = renderHook(() => useBossTemplates(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });
});

// ── Hook type exports from hooks/useActiveBoss.ts ──────────────────

import { useActiveBossEnhanced } from "../hooks/useActiveBoss";
import type {
  ActiveBossState,
  DamageCalculation,
  KillEstimate,
} from "../hooks/useActiveBoss";

describe("hooks/useActiveBoss exports", () => {
  it("useActiveBossEnhanced is a function", () => {
    expect(typeof useActiveBossEnhanced).toBe("function");
  });

  it("ActiveBossState type is null", () => {
    const state: ActiveBossState = null;
    expect(state).toBeNull();
  });

  it("DamageCalculation has damage number", () => {
    const calc: DamageCalculation = { damage: 10 };
    expect(calc.damage).toBe(10);
  });

  it("KillEstimate has sessionsRemaining number", () => {
    const estimate: KillEstimate = { sessionsRemaining: 3 };
    expect(estimate.sessionsRemaining).toBe(3);
  });
});

// ── Hook exports from hooks/useBossEngagementSummary.ts ────────────

import {
  useBossEngagementSummaryForCoach,
  useBossEngagementSummary as useBossEngagementSummaryAlias,
} from "../hooks/useBossEngagementSummary";
import type { BossEngagementSummaryData } from "../hooks/useBossEngagementSummary";

describe("hooks/useBossEngagementSummaryForCoach", () => {
  it("is disabled when userId is null", () => {
    const { result } = renderHook(
      () => useBossEngagementSummaryForCoach(null),
      { wrapper: createWrapper() },
    );
    expect(result.current.isFetching).toBe(false);
  });

  it("fetches and returns zeroed data when userId provided", async () => {
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

  it("useBossEngagementSummary is the same reference as useBossEngagementSummaryForCoach", () => {
    expect(useBossEngagementSummaryAlias).toBe(useBossEngagementSummaryForCoach);
  });

  it("BossEngagementSummaryData has all expected fields at 0", () => {
    const data: BossEngagementSummaryData = {
      bossRouteOpenedCount: 0,
      bossCTAClickedCount: 0,
      bossDamageEventsCount: 0,
      recentSessionsWithBossProgress: 0,
    };
    expect(Object.keys(data)).toHaveLength(4);
  });
});

// ── Index exports ──────────────────────────────────────────────────

import * as bossIndex from "../index";

describe("boss index exports completeness", () => {
  const expectedFunctions = [
    "shouldShowBossPreview",
    "isBossVisibleAtSurface",
    "isCombatAllowed",
    "getBossDisplayCopy",
    "getBossEngagementSignals",
    "deriveBossEngagementLevel",
    "trackBossEvent",
    "trackBossRouteOpened",
    "trackBossCTAClicked",
  ];

  it.each(expectedFunctions)("exports %s as a function", (name) => {
    expect(typeof (bossIndex as Record<string, unknown>)[name]).toBe(
      "function",
    );
  });

  it("exports bossRepository object", () => {
    expect(bossIndex.bossRepository).toBeDefined();
    expect(typeof bossIndex.bossRepository).toBe("object");
  });

  it("exports PersonalBossBlockSchema", () => {
    expect(bossIndex.PersonalBossBlockSchema).toBeDefined();
  });

  it("exports hook functions", () => {
    expect(typeof bossIndex.useActiveBoss).toBe("function");
    expect(typeof bossIndex.useBossEngagementSummary).toBe("function");
    expect(typeof bossIndex.useAvailableBosses).toBe("function");
  });
});
