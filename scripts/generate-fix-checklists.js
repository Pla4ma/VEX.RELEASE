#!/usr/bin/env node
// Generates per-rule markdown checklists from scripts/fix-batches/<rule>.json files.
// Each diagnostic gives: file:line + message teaser. Humans apply fixes manually.
// 67 rules → 67 md checklists in scripts/fix-checklists/.

/* eslint-disable */
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const BATCH_DIR = path.join(ROOT, 'scripts/fix-batches');
const OUT_DIR = path.join(ROOT, 'scripts/fix-checklists');

// Path-traversal guard: only safe rule names reach the filename join.
const SAFE_RULE_RE = /^[a-z0-9][a-z0-9-]{0,80}$/;

if (!fs.existsSync(BATCH_DIR)) {
  console.error(`Missing batch dir: ${BATCH_DIR}`);
  process.exit(1);
}
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

function emitChecklist(rule, items) {
  const lines = [];
  lines.push(`# ${rule} — manual fix checklist`);
  lines.push('');
  lines.push(`Diagnostics found: **${items.length}**.`);
  if (items.length === 0) {
    lines.push('');
    lines.push('_No diagnostics for this rule._');
    return lines.join('\n');
  }
  lines.push('');
  lines.push(`Estimated human time: ${Math.max(1, Math.ceil(items.length / 4))}-${Math.max(2, Math.ceil(items.length / 2))} minutes.`);
  lines.push('');
  lines.push('## Per-file fixes');
  lines.push('');
  const byFile = {};
  for (const x of items) {
    (byFile[x.filePath] = byFile[x.filePath] || []).push(x);
  }
  for (const [file, diags] of Object.entries(byFile).sort()) {
    lines.push(`### ${file}`);
    lines.push('');
    // Deterministic ordering: sort by line.
    diags.sort((a, b) => a.line - b.line);
    for (const d of diags) {
      const msg = (d.message || '').replace(/\.$/, '').split('.')[0];
      lines.push(`- L${d.line}: ${msg}.`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

const ruleFiles = fs.readdirSync(BATCH_DIR).filter(f => f.endsWith('.json'));
let generated = 0;
let skipped = 0;
for (const rf of ruleFiles) {
  const rule = rf.replace(/\.json$/, '');
  if (!SAFE_RULE_RE.test(rule)) {
    console.error(`Refusing unsafe rule name: ${rule}`);
    skipped += 1;
    continue;
  }
  if (process.env.DEBUG_CHECKLISTS) console.log(`Processing rule: ${rule} (${ruleFiles.length} total)`);
  const outPath = path.join(OUT_DIR, rule + '.md');
  try {
    const items = JSON.parse(fs.readFileSync(path.join(BATCH_DIR, rf), 'utf8'));
    fs.writeFileSync(outPath, emitChecklist(rule, items));
    generated += 1;
  } catch (e) {
    console.error(`Skipped ${rule}: ${e.message}`);
    skipped += 1;
  }
}
console.log(`Wrote ${generated} checklists (${skipped} skipped).`);
