// safe-extract-types.js - Extract type/interface/enum blocks from oversized files
const fs = require("fs");
const path = require("path");

const SRC = path.resolve(process.cwd(), "src");

const oversized = [];
function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (["node_modules",".expo","dist","archive","__tests__"].includes(e.name)) continue;
      walk(full);
    } else if (/\.(ts)$/.test(e.name) && !e.name.endsWith(".d.ts") && full.indexOf("__tests__") === -1 && full.indexOf("test") === -1) {
      const content = fs.readFileSync(full, "utf8");
      const lines = content.split("\n").length;
      if (lines > 200) {
        const hasClass = /export class\b/.test(content);
        const hasComponent = /export.*function|React\.FC|return\s*\(?\s*</.test(content);
        // Only target TYPE files (no classes, no components, no hooks, no react)
        if (!hasClass && !hasComponent && !full.endsWith(".tsx")) {
          oversized.push({ file: full, lines, hasInterface: /export interface\b/.test(content), hasType: /^export type\b/m.test(content), hasEnum: /export enum\b/.test(content) });
        }
      }
    }
  }
}
walk(SRC);

// Only extract from pure-type files (not logic/services)
const targets = oversized.filter(f => !f.file.match(/service|Service|hook|Hook|repository|Repository|index|store|Store/));
console.log("PURE TYPE FILES TO SPLIT:");
targets.forEach(t => console.log(t.lines + " " + path.relative(SRC, t.file)));
