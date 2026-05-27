import {
  experience,
  accessFor,
  HIDDEN_FEATURE_KEYS,
} from "./product-journey-debloat-personalization-helpers";
import type { FeatureKey } from "./product-journey-debloat-personalization-helpers";

describe("Group 7 — Release Truth", () => {
  it("7a: src/ is canonical (same as existing source-truth test)", () => {
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
        // directory may not exist
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

      if (hasImport) {
        violations.push(file.replace(process.cwd(), ""));
      }
    }

    expect(violations).toEqual([]);
  });

  it("7c: final-release deactivated features never visible at any session count", () => {
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

  it("7e: core execution loop always free (never premium-gated)", () => {
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
    expect(
      exp.primaryHomeCTA.intent === "START_SESSION" ||
        exp.primaryHomeCTA.intent === "CONTINUE_STUDY_PATH",
    ).toBe(true);
  });

  it("7f: no feature teases premium before user has real value", () => {
    const early = experience("calm", { totalCompletedSessions: 1 });
    expect(early.premium.shouldTease).toBe(false);

    const mid = experience("calm", { totalCompletedSessions: 4 });
    expect(mid.premium.shouldTease).toBe(false);
  });

  it("7g: all motivated profiles get correct primary home CTA", () => {
    expect(experience("calm").primaryHomeCTA.intent).toBe("START_SESSION");
    expect(experience("study_focused").primaryHomeCTA.intent).toBe(
      "CONTINUE_STUDY_PATH",
    );
    expect(experience("game_like").primaryHomeCTA.intent).toBe("START_SESSION");
  });

  it("7h: calm user never sees game_hub or boss_full_cta surfaces", () => {
    const exp = experience("calm", { totalCompletedSessions: 20 });
    expect(exp.bannedSurfaces).toContain("boss_full_cta");
    expect(exp.bannedSurfaces).toContain("game_hub");
  });
});
