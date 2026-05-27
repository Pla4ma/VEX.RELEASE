// apply-split.js - Extract types/configs to sibling file, fix imports
const fs = require("fs");
const path = require("path");

const SRC = process.argv[2] || "C:/Users/jonat/CascadeProjects/vex-app-old/src";

// Files to skip (auto-generated, business logic, etc.)
const SKIP = new Set([
  "types/supabase.ts",
  "features/liveops-config/final-release-classification.ts",
  "features/analytics/repository.ts",
  "features/challenges/challenge-bank-expansion.ts",
  "shared/accessibility/index.ts",
  "features/notifications/service.ts",
  "features/ai-coach/services/behavior-analytics.ts",
  "analytics/ABTestingFramework.ts",
  "feature-flags/FeatureFlagEngine.ts",
  "features/progression/utils/validation.ts",
  "features/notifications/SmartNotificationScheduler.ts",
  "features/achievements/AchievementEnhancement.ts",
  "features/streaks/StreakEvolutionSystem.ts",
  "features/analytics/schemas.ts",
  "features/analytics/repository/storage.ts",
  "features/settings/schemas.ts",
  "features/challenges/schemas.ts",
  "features/ai-coach/schemas.ts",
  "events/event-definitions.ts",
]);

function extractBlockTypes(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const relPath = path.relative(SRC, filePath);
  const dir = path.dirname(filePath);
  const baseName = path.basename(filePath, ".ts");

  // Find all top-level export interface/type/enum blocks
  const extracted = [];
  const lines = content.split("\n");
  const blockNames = new Set();

  // Find export blocks
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (/^export\s+(interface|type|enum)\s+(\w+)/.test(line)) {
      const match = line.match(/^export\s+(interface|type|enum)\s+(\w+)/);
      const kind = match[1];
      const name = match[2];
      const start = i;

      // Find end of block
      if (kind === "type") {
        // Type aliases end at semicolon
        while (i < lines.length && !lines[i].includes(";")) i++;
        const block = lines.slice(start, i + 1).join("\n");
        extracted.push({ kind, name, block, startLine: start, endLine: i });
        blockNames.add(name);
      } else if (kind === "interface" || kind === "enum") {
        // Find matching closing brace
        let depth = 0;
        let j = i;
        let started = false;
        while (j < lines.length) {
          for (const ch of lines[j]) {
            if (ch === "{") { depth++; started = true; }
            if (ch === "}") { depth--; }
          }
          if (started && depth === 0) { i = j; break; }
          j++;
        }
        const block = lines.slice(start, i + 1).join("\n");
        extracted.push({ kind, name, block, startLine: start, endLine: i });
        blockNames.add(name);
      }
    }
    // Also find export const blocks (config objects)
    if (/^export\s+const\s+(\w+)\s*[:=]\s*\{/.test(line)) {
      const match = line.match(/^export\s+const\s+(\w+)/);
      const name = match[1];
      const start = i;
      let depth = 0;
      let j = i;
      let started = false;
      while (j < lines.length) {
        for (const ch of lines[j]) {
          if (ch === "{") { depth++; started = true; }
          if (ch === "}") { depth--; }
        }
        if (started && depth === 0) { i = j; break; }
        j++;
      }
      const block = lines.slice(start, i + 1).join("\n");
      extracted.push({ kind: "const", name, block, startLine: start, endLine: i });
      blockNames.add(name);
    }
    i++;
  }

  if (extracted.length === 0) return null;

  // Create types file
  const typesFile = path.join(dir, baseName + "-types.ts");
  const typesContent = extracted.map(e => e.block).join("\n\n") + "\n";
  fs.writeFileSync(typesFile, typesContent);
  console.log(`  Created: ${path.relative(SRC, typesFile)} (${extracted.length} blocks)`);

  // Remove extracted blocks from original
  const remaining = [];
  const removedRanges = extracted.map(e => ({ start: e.startLine, end: e.endLine })).sort((a,b) => a.start - b.start);
  let rangeIdx = 0;
  for (let i = 0; i < lines.length; i++) {
    if (rangeIdx < removedRanges.length && i >= removedRanges[rangeIdx].start && i <= removedRanges[rangeIdx].end) {
      if (i === removedRanges[rangeIdx].end) rangeIdx++;
    } else {
      remaining.push(lines[i]);
    }
  }

  // Add import for types file
  const importLine = `import type { ${[...blockNames].sort().join(", ")} } from "./${baseName}-types";\n`;
  // Insert after last import
  let lastImportIdx = 0;
  for (let i = 0; i < remaining.length; i++) {
    if (/^import\s/.test(remaining[i].trim()) || /^import\s/.test(remaining[i].trim())) {
      lastImportIdx = i;
    }
  }
  remaining.splice(lastImportIdx + 1, 0, importLine);

  fs.writeFileSync(filePath, remaining.join("\n") + "\n");
  console.log(`  Updated: ${relPath}`);

  return { file: filePath, extracted: blockNames, typesFile };
}

// Walk and process all targets
const targets = [];
function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (["node_modules",".expo","dist","archive","__tests__"].includes(e.name)) continue;
      walk(full);
    } else if (/\.ts$/.test(e.name) && !e.name.endsWith(".d.ts") && full.indexOf("__tests__") === -1) {
      const rel = path.relative(SRC, full);
      if (SKIP.has(rel)) continue;
      const content = fs.readFileSync(full, "utf8");
      const lines = content.split("\n").length;
      if (lines > 400) {
        targets.push(full);
      }
    }
  }
}
walk(SRC);

console.log(`Processing ${targets.length} files >400 lines...`);
for (const t of targets) {
  console.log(`\nFile: ${path.relative(SRC, t)}`);
  try {
    extractBlockTypes(t);
  } catch(e) {
    console.log(`  ERROR: ${e.message}`);
  }
}
console.log("\nDONE");