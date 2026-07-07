import os, re, sys
from collections import defaultdict

ROOT = '.'  # project root
SRC = 'src'

# Find all tsx files
tsx_files = []
for root, _, files in os.walk(SRC):
    for f in files:
        if f.endswith('.tsx') or f.endswith('.ts'):
            tsx_files.append(os.path.join(root, f))

print(f'Scanned {len(tsx_files)} files in src/')

# Pattern matches `style={{\n` or `style={ { ` style={{
# We want to find 8+ LITERAL/EXPRESSION properties within
# Easily detect: between style={{ and matching }} on same block
results = []
for fpath in tsx_files:
    try:
        content = open(fpath, encoding='utf-8').read()
    except UnicodeDecodeError:
        continue
    # Find all `style={{` occurrences with positions
    pattern = re.compile(r'style=\{\{')
    for m in pattern.finditer(content):
        start = m.end()
        # Walk forward to find balanced }} (allowing braces inside)
        depth = 2  # we are inside {{ which is depth 2
        i = start
        while i < len(content) and depth > 0:
            ch = content[i]
            if ch == '{':
                depth += 1
            elif ch == '}':
                depth -= 1
            i += 1
        if depth != 0:
            continue
        # Extract the inner (between {{ and }})
        body = content[start:i-2]
        # Count properties: top-level comma-separated entries
        # Count commas at depth-0 by splitting carefully
        # Simple heuristic: count newline-prefixed entries that look like `key:`
        prop_count = body.count(',\n')
        if prop_count >= 7:  # 7 commas = 8 properties
            # Find line number of `style={{`
            line_no = content[:m.start()].count('\n') + 1
            results.append({
                'file': fpath,
                'line': line_no,
                'props': prop_count + 1,
                'preview': body.strip()[:200].replace('\n', ' | ')
            })

print(f'\nFOUND {len(results)} style objects with 8+ properties in src/\n')
# Group by file
byfile = defaultdict(list)
for r in results:
    byfile[r['file']].append(r)

for f, sites in sorted(byfile.items()):
    print(f'\n{f}  ({len(sites)} sites)')
    for s in sites:
        print(f'  line {s["line"]}, {s["props"]} props: {s["preview"][:120]}...')
