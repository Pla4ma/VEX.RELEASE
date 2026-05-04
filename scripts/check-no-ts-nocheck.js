const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', 'src');
const BASELINE = 56;

function walk(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });

  return entries.flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return walk(fullPath);
    }

    if (!/\.(ts|tsx)$/.test(entry.name)) {
      return [];
    }

    return [fullPath];
  });
}

const files = walk(ROOT);
const count = files.reduce((total, filePath) => {
  const contents = fs.readFileSync(filePath, 'utf8');
  return total + (contents.includes('@ts-nocheck') ? 1 : 0);
}, 0);

if (count > BASELINE) {
  console.error(`Found ${count} files using @ts-nocheck. Baseline is ${BASELINE}.`);
  process.exit(1);
}

console.log(`@ts-nocheck count: ${count}/${BASELINE}`);
