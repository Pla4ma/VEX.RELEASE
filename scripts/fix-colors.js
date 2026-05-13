const fs = require('fs');
const path = require('path');

function getAllFiles(dir, ext = ['.ts', '.tsx']) {
  const results = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const full = path.join(dir, item.name);
    if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules') {
      results.push(...getAllFiles(full, ext));
    } else if (item.isFile() && ext.some(e => item.name.endsWith(e))) {
      results.push(full);
    }
  }
  return results;
}

const files = getAllFiles(path.join(__dirname, '../src_impl'));
let replacedCount = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  const hexRegex = /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})(?=[^\w])/g;
  
  content = content.replace(hexRegex, (match) => {
    changed = true;
    const lower = match.toLowerCase();
    if (lower === '#fff' || lower === '#ffffff') return 'theme.colors.background.primary';
    if (lower === '#000' || lower === '#000000') return 'theme.colors.text.primary';
    if (lower.startsWith('#ff') || lower.startsWith('#fc')) return 'theme.colors.error.DEFAULT';
    if (lower.startsWith('#00ff') || lower.startsWith('#4a')) return 'theme.colors.success.DEFAULT';
    return 'theme.colors.primary[500]';
  });

  if (changed) {
    fs.writeFileSync(file, content);
    replacedCount++;
  }

}
console.log(`Done mapping colors in ${replacedCount} files.`);
