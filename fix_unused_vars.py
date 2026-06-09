#!/usr/bin/env python3
"""Batch fix @typescript-eslint/no-unused-vars errors."""
import subprocess, json, re, os

PROJECT = '/root/projects/VEX.RELEASE'

def get_errors():
    result = subprocess.run(
        ['./node_modules/.bin/eslint', 'src', '--ext', '.ts,.tsx', '--format', 'json', '--no-cache', '--quiet'],
        capture_output=True, text=True, cwd=PROJECT, timeout=300)
    return json.loads(result.stdout)

def fix_file(fp, msgs):
    full = os.path.join(PROJECT, fp)
    if not os.path.exists(full): return False
    with open(full) as f: content = f.read()
    orig = content
    lines = content.split('\n')
    by_line = {}
    for m in msgs:
        by_line.setdefault(m['line'], []).append(m)
    for ln, ms in sorted(by_line.items(), reverse=True):
        idx = ln - 1
        if idx >= len(lines): continue
        line = lines[idx]
        for m in ms:
            msg = m.get('message', '')
            # Unused import
            mm = re.search(r"'(\w+)' is defined but never used", msg)
            if mm:
                v = mm.group(1)
                if re.match(r'^\s*import\s+', line):
                    if re.match(rf'^\s*import\s+\{{?\s*{v}\s*\}}?\s+from\s', line) or re.match(rf'^\s*import\s+{v}\s+from\s', line):
                        lines[idx] = ''
                    elif re.search(rf'\b{v}\b', line):
                        nl = re.sub(rf'\s*{v}\s*,?', '', line)
                        nl = re.sub(r'\{\s*,', '{', nl)
                        nl = re.sub(r',\s*\}', '}', nl)
                        lines[idx] = nl
                continue
            # Unused var in destructuring
            mm = re.search(r"'(\w+)' is assigned a value but never used", msg)
            if mm:
                v = mm.group(1)
                if '{' in line and '}' in line:
                    lines[idx] = re.sub(rf'(\{{[^}}]*)\b{v}\b', rf'\1{v}: _{v}', line)
                continue
    content = '\n'.join(lines)
    content = re.sub(r'\n{3,}', '\n\n', content)
    if content != orig:
        with open(full, 'w') as f: f.write(content)
        return True
    return False

data = get_errors()
files = {}
for f in data:
    fp = f['filePath'].replace(PROJECT + '/', '')
    ms = [m for m in f.get('messages', []) if m.get('ruleId') == '@typescript-eslint/no-unused-vars']
    if ms: files[fp] = ms

fixed = sum(1 for fp, ms in files.items() if fix_file(fp, ms))
print(f"Fixed {fixed}/{len(files)} files")

data = get_errors()
remaining = sum(1 for f in data for m in f.get('messages', []) if m.get('ruleId') == '@typescript-eslint/no-unused-vars')
print(f"Remaining no-unused-vars: {remaining}")
