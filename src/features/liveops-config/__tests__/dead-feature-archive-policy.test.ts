import fs from "fs";
import path from "path";

const root = path.resolve(__dirname, "../../../..");
const srcRoot = path.join(root, "src");

const deadFeatureSegments = [
  "features/spectacle",
  "features/emotion-retention",
  "features/retention",
  "features/shop",
  "features/inventory",
  "features/wallet",
  "features/battle-pass",
  "features/seasons",
  "features/live-ops",
  "features/items",
  "features/squads",
  "features/social",
  "features/daily-mission",
  "features/weekly-quests",
  "features/session-story",
  "features/boss-realtime",
];

const sourceExtensions = new Set([".ts", ".tsx", ".js", ".jsx"]);

function normalize(value: string): string {
  return value.replaceAll("\\", "/");
}

function readSourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "__tests__") return [];
      return readSourceFiles(fullPath);
    }
    return sourceExtensions.has(path.extname(entry.name)) ? [fullPath] : [];
  });
}

function importSpecifiers(source: string): string[] {
  const matches = source.matchAll(
    /\b(?:import|export)\b[\s\S]*?\bfrom\s*['"]([^'"]+)['"]|require\(\s*['"]([^'"]+)['"]\s*\)/g,
  );
  return Array.from(matches, (match) => match[1] ?? match[2] ?? "");
}

function expectNoImports(files: string[], blocked: string[]): void {
  const violations = files.flatMap((file) => {
    const source = fs.readFileSync(file, "utf8");
    const specs = importSpecifiers(source).map(normalize);
    return specs
      .filter((spec) => blocked.some((segment) => spec.includes(segment)))
      .map((spec) => `${normalize(path.relative(root, file))} -> ${spec}`);
  });
  expect(violations).toEqual([]);
}

describe("dead feature archive policy", () => {
  const files = readSourceFiles(srcRoot);

  it("active src does not import archived feature folders", () => {
    expectNoImports(files, ["archive/features"]);
  });

  it("active src does not import final-release-dead feature folders", () => {
    expectNoImports(files, deadFeatureSegments);
  });

  it("app root does not import spectacle or emotion retention", () => {
    const rootSources = [
      fs.readFileSync(path.join(srcRoot, "app/App.tsx"), "utf8"),
      fs.readFileSync(path.join(srcRoot, "app/bootstrap.ts"), "utf8"),
      fs.readFileSync(
        path.join(srcRoot, "app/providers/AppProviders.tsx"),
        "utf8",
      ),
    ].join("\n");
    expect(rootSources).not.toMatch(
      /spectacle|initializeEmotionRetention|emotion-retention/,
    );
  });

  it("features index does not export archived systems", () => {
    const source = fs.readFileSync(
      path.join(srcRoot, "features/index.ts"),
      "utf8",
    );
    expect(source).not.toMatch(/sessionStory|shop|session-story|\.\/shop/);
  });

  it("home does not import daily weekly social or squads dead features", () => {
    const homeFiles = files.filter((file) =>
      normalize(file).includes("/src/screens/home/"),
    );
    expectNoImports(homeFiles, [
      "daily-mission",
      "weekly-quests",
      "features/social",
      "features/squads",
    ]);
  });

  it("completion does not import chest battle pass shop or inventory", () => {
    const completionFiles = files.filter((file) =>
      normalize(file).includes("/src/screens/session/"),
    );
    expectNoImports(completionFiles, [
      "features/battle-pass",
      "features/shop",
      "features/inventory",
    ]);
    const source = completionFiles
      .map((file) => fs.readFileSync(file, "utf8"))
      .join("\n");
    expect(source).not.toMatch(
      /SessionChestCard|SessionPremiumChestCard|useSessionCompleteChest/,
    );
  });

  it("route registry does not include dead routes", () => {
    const source = fs.readFileSync(
      path.join(srcRoot, "navigation/feature-route-registry.ts"),
      "utf8",
    );
    const registry = source.slice(
      0,
      source.indexOf("const ARCHIVED_ROUTE_SET"),
    );
    expect(registry).not.toMatch(
      /Guild|Shop|Inventory|Vault|PostSessionStory|BattlePass/,
    );
  });
});
