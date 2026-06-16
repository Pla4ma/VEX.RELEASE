// Auto-apply prev-prop pattern to useEffect that sets state based on prop
// This is complex and risky. Let me focus on simpler cases.

// Pattern: useEffect that has [prop1, prop2] in deps and calls setSomething(prop1)
// The fix: compare prop with prev and only update if different

const fs = require('fs');
const path = require('path');
const r = require('../doctor-report.json');

const root = 'C:/Users/jonat/CascadeProjects/vex-app-old';
const items = r.diagnostics.filter(d => d.rule === 'no-adjust-state-on-prop-change');

let totalFixed = 0;

for (const it of items) {
  const full = path.join(root, it.filePath);
  if (!fs.existsSync(full)) continue;
  totalFixed++;
}

console.log(`Considered: ${totalFixed}`);
