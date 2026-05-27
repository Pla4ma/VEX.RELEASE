// split-oversized.js - Extract type/interface/enum/const blocks from >400 line files
const fs = require("fs");
const path = require("path");

const SRC = process.argv[2] || "C:/Users/jonat/CascadeProjects/vex-app-old/src";

function walk(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (["node_modules",".expo","dist","archive","__tests__"].includes(e.name)) continue;
      results.push(...walk(full));
    } else if (/\.ts$/.test(e.name) && !e.name.endsWith(".d.ts") && full.indexOf("__tests__") === -1) {
      const content = fs.readFileSync(full, "utf8");
      const lines = content.split("\n").length;
      if (lines > 400) {
        const hasClass = /export class\b/.test(content);
        const isTsx = full.endsWith(".tsx");
        if (!hasClass && !isTsx) {
          // Find standalone type/interface/enum/const blocks
          const blocks = [];
          const re = /(?:^|\n)(export\s+(?:interface|type|enum|const)\s+[^{=]+(?:{[^}]*}|\s*=\s*[^;]+;))/gs;
          let m;
          while ((m = re.exec(content)) !== null) {
            // Check this block is standalone (not inside class/function)
            const beforeIdx = m.index;
            const classOpen = content.lastIndexOf("class ", beforeIdx);
            const funcOpen = content.lastIndexOf("function ", beforeIdx);
            const bracketOpen = content.lastIndexOf("{", beforeIdx);
            if (classOpen > 0 && bracketOpen > classOpen) continue; // inside class
            blocks.push({ text: m[1].trim(), offset: m.index, length: m[0].length });
          }
          if (blocks.length > 0) {
            results.push({ file: full, lines, blocks: blocks.length });
          }
        }
      }
    }
  }
  return results;
}

const results = walk(SRC);
results.sort((a,b) => b.lines - a.lines);
results.forEach(r => {
  const rel = path.relative(SRC, r.file);
  console.log(`${r.lines} ${rel} (${r.blocks} extractable blocks)`);
});