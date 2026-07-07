import json, os, sys
from collections import Counter, defaultdict

# Find the latest react-doctor output dir
base = r'C:\Users\jonat\AppData\Local\Temp' if sys.platform == 'win32' else '/tmp'
candidates = []
if sys.platform == 'win32' and os.path.isdir(base):
    for name in os.listdir(base):
        if name.startswith('react-doctor-'):
            candidates.append((os.path.getmtime(os.path.join(base, name)), os.path.join(base, name)))
elif os.path.isdir('/tmp'):
    for name in os.listdir('/tmp'):
        if name.startswith('react-doctor-'):
            candidates.append((os.path.getmtime(os.path.join('/tmp', name)), os.path.join('/tmp', name)))
candidates.sort(reverse=True)
print('FOUND:', len(candidates), 'react-doctor dirs')
print('NEWEST:', candidates[0][1])

DIAG_PATH = os.path.join(candidates[0][1], 'diagnostics.json')
print('DIAG_PATH =', DIAG_PATH)
with open(DIAG_PATH) as f:
    data = json.load(f)

# Walk to find diagnostics list
def find_diagnostics(obj):
    if isinstance(obj, list):
        for it in obj:
            r = find_diagnostics(it)
            if r is not None:
                return r
        return None
    if isinstance(obj, dict):
        if 'diagnostics' in obj and isinstance(obj['diagnostics'], list) and obj['diagnostics']:
            if isinstance(obj['diagnostics'][0], dict) and 'filePath' in obj['diagnostics'][0]:
                return obj['diagnostics']
        for v in obj.values():
            r = find_diagnostics(v)
            if r is not None:
                return r
    return None

dlist = find_diagnostics(data)
print('diagnostics len:', len(dlist))


def clean(p):
    p = p.replace('\\\\', '/').replace('\\', '/')
    p = p.lstrip('./').lstrip('/')
    if 'CascadeProjects/vex-app-old/' in p:
        p = p.split('CascadeProjects/vex-app-old/')[-1]
    return p.lstrip('/')


# Top dir counts
top_dirs = Counter()
for d in dlist:
    fp = clean(d['filePath'])
    top_dirs[fp.split('/')[0] if '/' in fp else fp] += 1

print('\nTOP DIRECTORIES:')
for k, v in top_dirs.most_common():
    print(f'  {k}: {v}')

# Per rule
rule_total = Counter()
rule_src = Counter()
for d in dlist:
    fp = clean(d['filePath'])
    rule_total[d['rule']] += 1
    if fp.startswith('src/'):
        rule_src[d['rule']] += 1

focus = ['prefer-module-scope-static-value', 'no-inline-exhaustive-style',
        'no-dynamic-import-path', 'no-event-handler', 'only-export-components']
print('\n=== FOCUS RULES ===')
for r in focus:
    src_n = rule_src.get(r, 0)
    tot = rule_total.get(r, 0)
    print(f'{r}: total {tot}  | src {src_n}')

# List actual src/ sites
print('\n=== SRC FILES PER FOCUS RULE ===')
for r in focus:
    paths = set()
    for d in dlist:
        if d['rule'] == r:
            fp = clean(d['filePath'])
            if fp.startswith('src/'):
                paths.add(fp)
    if paths:
        print(f'\n--- {r} ({len(paths)} unique src files) ---')
        for p in sorted(paths):
            print(f'  {p}')
