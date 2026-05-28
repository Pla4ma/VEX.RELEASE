import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();

function readSource(path: string): string {
  return readFileSync(join(ROOT, path), "utf8");
}

describe("authenticated route smoke", () => {
  it("registers production navigation targets in the authenticated stack", () => {
    const source = readSource("src/navigation/root-stack-authenticated-routes.tsx");

    expect(source).toContain('name="FocusScoreDashboard"');
    expect(source).toContain('name="Achievements"');
    expect(source).toContain('name="Analytics"');
    expect(source).toContain("../screens/analytics/AnalyticsScreen");
  });

  it("does not navigate to archived Shop route from streak funeral", () => {
    const source = readSource("src/screens/streaks/StreakFuneralScreen.tsx");

    expect(source).not.toContain('navigate("Shop"');
    expect(source).not.toContain("navigate('Shop'");
  });
});
