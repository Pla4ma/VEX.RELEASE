// extract-types.js - Safely extract types/interfaces/enums from oversized files
const fs = require("fs");
const path = require("path");

const SRC = "C:/Users/jonat/CascadeProjects/vex-app-old/src";

// Find all files >200 lines categorized as "types"
const oversized = [];
function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (["node_modules",".expo","dist","archive","__tests__"].includes(e.name)) continue;
      walk(full);
    } else if (/\.(ts|tsx)$/.test(e.name) && !e.name.endsWith(".d.ts") && full.indexOf("test") === -1) {
      const content = fs.readFileSync(full, "utf8");
      const lines = content.split("\n").length;
      if (lines > 200) {
        const hasInterface = /export interface\b|interface\b/.test(content);
        const hasType = /^export type\b/m.test(content) || /^type\b/m.test(content);
        const hasEnum = /export enum\b/.test(content);
        const hasZod = /z\.object|z\.string|z\.number/.test(content);
        const hasClass = /export class\b/.test(content);
        if ((hasInterface || hasType || hasEnum) && !hasClass && !hasZod) {
          oversized.push({ file: full, lines });
        }
      }
    }
  }
}
walk(SRC);

console.log(JSON.stringify(oversized.sort((a,b) => b.lines - a.lines)));