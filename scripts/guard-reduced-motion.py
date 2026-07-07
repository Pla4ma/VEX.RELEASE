import re, pathlib, os, sys, json

HOOK_FILE = 'src/hooks/useReducedMotion.ts'

def relative_path(from_file: pathlib.Path, to_file: str) -> str:
    to = pathlib.Path(to_file)
    rel = os.path.relpath(to.with_suffix(''), from_file.parent)
    if not rel.startswith('..'):
        rel = './' + rel
    return rel.replace('\\', '/')

def add_import(lines: list[str], import_path: str) -> list[str]:
    import_line = f"import {{ useReducedMotion }} from '{import_path}';"

    # Find the last import block and insert after its closing ';'
    last_import_close = -1
    for i, line in enumerate(lines):
        stripped = line.strip()
        if stripped.startswith('import '):
            # Find the closing semicolon of this import block
            for j in range(i, min(i + 10, len(lines))):
                if lines[j].strip().endswith(';'):
                    last_import_close = j
                    break
    if last_import_close == -1:
        return lines
    new_lines = lines[:last_import_close + 1]
    new_lines.append(import_line)
    new_lines.extend(lines[last_import_close + 1:])
    return new_lines

def insert_hook_after_open(lines: list[str]) -> tuple[list[str], bool]:
    import_end = -1
    for i, line in enumerate(lines):
        if line.strip().startswith('import '):
            import_end = i

    for i in range(import_end + 1, len(lines)):
        line = lines[i]
        stripped = line.strip()
        if not stripped or stripped.startswith('//') or stripped.startswith('*'):
            continue

        # Function declaration: function Name(...) { ... }
        # Body opening is the first line after the signature that contains both ')' and '{'.
        if re.match(r'^(export\s+)?(default\s+)?function\s+\w+', stripped):
            for j in range(i, min(i + 15, len(lines))):
                if 'return' in lines[j] and not re.match(r'^\s*return\s*\(?', lines[j]):
                    break
                if ')' in lines[j] and '{' in lines[j]:
                    indent = len(lines[j]) - len(lines[j].lstrip())
                    hook = ' ' * (indent + 2) + 'const { isReducedMotion } = useReducedMotion();'
                    return lines[:j + 1] + [hook] + lines[j + 1:], True
            return lines, False

        # Arrow function: const Name = (...) => { ... } or const Name = (...) => (...)
        if re.match(r'^(export\s+)?const\s+\w+\s*=', stripped):
            for j in range(i, min(i + 15, len(lines))):
                if 'return' in lines[j] and not re.match(r'^\s*return\s*\(?', lines[j]):
                    break
                if '=>' in lines[j] and '{' in lines[j]:
                    indent = len(lines[j]) - len(lines[j].lstrip())
                    hook = ' ' * (indent + 2) + 'const { isReducedMotion } = useReducedMotion();'
                    return lines[:j + 1] + [hook] + lines[j + 1:], True
                if re.search(r'\)\s*=>\s*[\(<]', lines[j]):
                    indent = len(lines[j]) - len(lines[j].lstrip())
                    hook = ' ' * (indent + 2) + 'const { isReducedMotion } = useReducedMotion();'
                    return lines[:j + 1] + [hook] + lines[j + 1:], True
            return lines, False

    return lines, False

def guard_animations(c: str) -> str:
    # entering={X} -> entering={isReducedMotion ? undefined : X}
    # only if not already guarded
    c = re.sub(r'\b(entering)\s*=\s*\{(?!\s*isReducedMotion)', r'\1={isReducedMotion ? undefined : ', c)
    c = re.sub(r'\b(exiting)\s*=\s*\{(?!\s*isReducedMotion)', r'\1={isReducedMotion ? undefined : ', c)
    c = re.sub(r'\b(layout)\s*=\s*\{(?!\s*isReducedMotion)', r'\1={isReducedMotion ? undefined : ', c)
    return c

def process_file(path: pathlib.Path) -> dict:
    c = path.read_text(encoding='utf-8')

    if 'useReducedMotion' in c or 'isReducedMotion' in c:
        return {'path': str(path), 'status': 'already_fixed'}
    if '.test.' in path.name:
        return {'path': str(path), 'status': 'test'}

    has_entering = bool(re.search(r'\bentering\s*=', c))
    has_exiting = bool(re.search(r'\bexiting\s*=', c))
    has_layout = bool(re.search(r'\blayout\s*=', c))
    has_complex = (
        'useAnimatedStyle' in c
        or 'useSharedValue' in c
        or 'useAnimatedProps' in c
        or 'useAnimatedGestureHandler' in c
        or re.search(r'\bwithSpring\b|\bwithTiming\b|\bwithDecay\b|\bwithDelay\b|\bwithRepeat\b|\bwithSequence\b|\bwithFling\b', c)
    )

    if not (has_entering or has_exiting or has_layout) or has_complex:
        return {'path': str(path), 'status': 'complex_or_no_anims'}

    lines = c.split('\n')
    import_path = relative_path(path, HOOK_FILE)
    lines = add_import(lines, import_path)
    lines, ok = insert_hook_after_open(lines)
    if not ok:
        return {'path': str(path), 'status': 'hook_insert_failed'}

    c2 = '\n'.join(lines)
    c2 = guard_animations(c2)

    if c2 == c:
        return {'path': str(path), 'status': 'no_change'}

    path.write_text(c2, encoding='utf-8')
    return {'path': str(path), 'status': 'guarded'}

if __name__ == '__main__':
    target = sys.argv[1] if len(sys.argv) > 1 else 'src'
    target_path = pathlib.Path(target)
    if target_path.is_file():
        files = [target_path]
    else:
        files = sorted(p for p in target_path.rglob('*.tsx') if '.test.' not in p.name)
    results = []
    for f in files:
        c = f.read_text(encoding='utf-8')
        if 'useReducedMotion' in c: continue
        if not re.search(r'\bentering\s*=|\bexiting\s*=|\blayout\s*=', c): continue
        if 'useAnimatedStyle' in c or 'useSharedValue' in c or re.search(r'\bwithSpring\b|\bwithTiming\b', c): continue
        results.append(process_file(f))

    from collections import Counter
    counts = Counter(r['status'] for r in results)
    print(json.dumps(counts, indent=2))
    for r in results:
        if r['status'] in ('hook_insert_failed', 'no_change'):
            print(r)
