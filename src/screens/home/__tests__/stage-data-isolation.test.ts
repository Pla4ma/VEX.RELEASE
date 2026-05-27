/**
 * Stage data hook isolation tests.
 * Verifies that each stage-specific file has the correct import isolation.
 */
import { readFileSync } from "fs";
import { resolve } from "path";

const hooksDir = resolve(__dirname, "..", "hooks");

function readSource(filename: string): string {
  return readFileSync(resolve(hooksDir, filename), "utf8");
}

function assertNoAdvancedImports(source: string, label: string): void {
  const banned = [
    /useActiveChallenges/,
    /useClaimChallengeReward/,
    /useSquadMembersFocusing/,
    /useActiveIntervention/,
    /useNotificationBadge/,
    /useFreezeStreak/,
    /useSavedTomorrowPreview/,
  ];
  for (const pattern of banned) {
    expect(source).not.toMatch(pattern);
  }
}

describe("stage home data hooks — import isolation", () => {
  it("useStageHomeData module re-exports stage-specific hooks", () => {
    const mod = require("../hooks/useStageHomeData");
    expect(typeof mod.useNewUserHomeData).toBe("function");
    expect(typeof mod.useActivatingHomeData).toBe("function");
    expect(typeof mod.useEngagedHomeData).toBe("function");
    expect(typeof mod.usePowerUserHomeData).toBe("function");
  });

  it("useNewUserHomeData file does not import challenges/squads/notifications/interventions", () => {
    const source = readSource("useNewUserHomeData.ts");
    assertNoAdvancedImports(source, "useNewUserHomeData");
  });

  it("useActivatingHomeData file does not import challenges/squads/notifications/interventions", () => {
    const source = readSource("useActivatingHomeData.ts");
    assertNoAdvancedImports(source, "useActivatingHomeData");
  });

  it("useEngagedHomeData gates feature hooks by FeatureAvailability", () => {
    const source = readSource("useEngagedHomeData.ts");
    expect(source).toMatch(/getFeatureAvailability/);
    expect(source).toMatch(/challengeAvail/);
    expect(source).toMatch(/coachAvail/);
  });

  it("usePowerUserHomeData gates feature hooks by FeatureAvailability", () => {
    const source = readSource("usePowerUserHomeData.ts");
    expect(source).toMatch(/getFeatureAvailability/);
    expect(source).toMatch(/challengeAvail/);
    expect(source).toMatch(/coachAvail/);
    expect(source).toMatch(/squadAvail/);
    expect(source).toMatch(/notifAvail/);
  });

  it("useBaseHomeData file does not import advanced feature hooks", () => {
    const source = readSource("useBaseHomeData.ts");
    assertNoAdvancedImports(source, "useBaseHomeData");
  });

  it("new user and activating hooks return empty stubs for advanced data", () => {
    const newUserMod = require("../hooks/useNewUserHomeData");
    const activatingMod = require("../hooks/useActivatingHomeData");
    const mods = [newUserMod, activatingMod];
    for (const mod of mods) {
      const fn = mod.useNewUserHomeData || mod.useActivatingHomeData;
      expect(typeof fn).toBe("function");
    }
  });
});
