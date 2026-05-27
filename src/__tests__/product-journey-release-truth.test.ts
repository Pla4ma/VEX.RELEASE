/**
 * Product Journey — Release Truth + Consolidation
 */
import { jest } from "@jest/globals";
import {
  experience,
  firstWeek,
  accessFor,
  HIDDEN_FEATURE_KEYS,
  assertFullyHidden,
  assertCoreAvailable,
  getFeatureAvailability,
} from "./debloat-test-helpers";
import type { FeatureKey } from "../features/liveops-config/feature-access";

// ═══ Group 7 — Release Truth ═════════════════════════════════════

describe("Group 7 — Release Truth", () => {
  it("7a: src/ is canonical", () => {
    const fs = jest.requireActual("fs");
    expect(fs.existsSync(require("path").join(process.cwd(), "src"))).toBe(
      true,
    );
  });

  it("7b: no runtime imports from src_impl_archive", () => {
    const path = require("path");
    const fs = require("fs");
    function findAllTsFiles(root: string): string[] {
      const results: string[] = [];
      try {
        const entries = fs.readdirSync(root, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(root, entry.name);
          if (
            entry.isDirectory() &&
            entry.name !== "node_modules" &&
            entry.name !== "__tests__"
          ) {
            results.push(...findAllTsFiles(fullPath));
          } else if (/\.(ts|tsx)$/.test(entry.name)) {
            results.push(fullPath);
          }
        }
      } catch {
        /* directory may not exist */
      }
      return results;
    }
    const srcFiles = findAllTsFiles(path.join(process.cwd(), "src"));
    const violations: string[] = [];
    for (const file of srcFiles) {
      const content = fs.readFileSync(file, "utf8");
      const hasImport =
        content.includes("'../src_impl_archive") ||
        content.includes('"../src_impl_archive') ||
        content.includes("'../../src_impl_archive") ||
        content.includes("'src_impl_archive") ||
        content.includes('"src_impl_archive');
      if (hasImport) violations.push(file.replace(process.cwd(), ""));
    }
    expect(violations).toEqual([]);
  });

  it("7c: final-release deactivated features never visible", () => {
    for (const sessions of [0, 1, 5, 10, 50, 100, 999]) {
      const features = accessFor(sessions);
      HIDDEN_FEATURE_KEYS.forEach((key) => {
        expect(features[key]!.isUnlocked).toBe(false);
      });
    }
  });

  it("7d: app store copy excludes hidden features", () => {
    const hidden = [
      "battle_pass",
      "shop",
      "inventory",
      "wagers",
      "rivals",
      "squads",
      "leaderboards",
    ];
    const exp = experience("calm", { totalCompletedSessions: 20 });
    for (const h of hidden) {
      expect(exp.hiddenSystems).toContain(h);
    }
    expect(exp.release.hidden).toEqual(
      expect.arrayContaining(["shop", "inventory", "battle_pass", "wagers"]),
    );
  });

  it("7e: core execution loop always free", () => {
    const exp = experience("study_focused", {
      premiumFeatureAttempts: ["weekly_intelligence"],
      totalCompletedSessions: 7,
    });
    expect(exp.premium.mustRemainFree).toContain("start_session");
    expect(exp.premium.mustRemainFree).toContain("complete_session");
    expect(exp.premium.mustRemainFree).toContain("basic_xp");
    expect(exp.premium.mustRemainFree).toContain("basic_streak");
    expect(exp.premium.mustRemainFree).toContain("basic_coach");
    expect(exp.homeSections).toContain("primary_session");
  });

  it("7f: no feature teases premium before user has real value", () => {
    expect(
      experience("calm", { totalCompletedSessions: 1 }).premium.shouldTease,
    ).toBe(false);
    expect(
      experience("calm", { totalCompletedSessions: 4 }).premium.shouldTease,
    ).toBe(false);
  });

  it("7g: all motivated profiles get correct primary home CTA", () => {
    expect(experience("calm").primaryHomeCTA.intent).toBe("START_SESSION");
    expect(experience("study_focused").primaryHomeCTA.intent).toBe(
      "CONTINUE_STUDY_PATH",
    );
    expect(experience("game_like").primaryHomeCTA.intent).toBe("START_SESSION");
  });

  it("7h: calm user never sees game_hub or boss_full_cta", () => {
    const exp = experience("calm", { totalCompletedSessions: 20 });
    expect(exp.bannedSurfaces).toContain("boss_full_cta");
    expect(exp.bannedSurfaces).toContain("game_hub");
  });
});

// ═══ Consolidation — Cross-Group Verification ════════════════════

describe("Consolidation — No regression", () => {
  it("hidden systems list matches between resolveVexExperience and first week", () => {
    const exp = experience("calm", { totalCompletedSessions: 20 });
    const fw = firstWeek({ completedSessions: 20, daysSinceOnboarding: 20 });
    for (const s of fw.hiddenSurfaces) {
      if (
        s === "premium_hard_sell" ||
        s === "premium_currency" ||
        s === "advanced_economy"
      ) {
        expect(exp.hiddenSystems).toContain(
          s === "premium_currency"
            ? "premium_currency"
            : s === "advanced_economy"
              ? "advanced_economy"
              : "premium_currency",
        );
      }
    }
    expect(exp.hiddenSystems).toContain("battle_pass");
    expect(exp.hiddenSystems).toContain("shop");
    expect(exp.hiddenSystems).toContain("inventory");
    expect(exp.hiddenSystems).toContain("rivals");
    expect(exp.hiddenSystems).toContain("squads");
  });

  it("all final-release features confirmed inaccessible at every session count", () => {
    const sessionCounts = [0, 1, 3, 5, 7, 10, 15, 20, 50, 100, 500, 999];
    for (const sessions of sessionCounts) {
      const f = accessFor(sessions);
      HIDDEN_FEATURE_KEYS.forEach((key) => assertFullyHidden(f, key));
    }
  });

  it("core features available from day zero", () => {
    const f = accessFor(0);
    const core: FeatureKey[] = [
      "focus_session",
      "home_tab",
      "focus_tab",
      "profile_tab",
      "progress_view",
      "ai_coach_basic",
    ];
    core.forEach((k) => assertCoreAvailable(f, k));
  });
});
