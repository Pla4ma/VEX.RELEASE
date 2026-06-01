#!/usr/bin/env python3
"""Fix remaining no-void ESLint warnings - arrow function inline void operators."""
import re
import glob
import os


def fix_file(filepath):
    """Fix void operator usages in arrow function expressions."""
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Pattern: => void expression  (in arrow function body)
    # Replace => void expr with => expr
    # But NOT things like ): void => (return type annotation)
    new_content = re.sub(r'(=>\s*)void\s+', r'\1', content)
    
    changes = 0
    if new_content != content:
        changes = content.count('void') - new_content.count('void')
        with open(filepath, 'w') as f:
            f.write(new_content)
    
    return changes


def main():
    src_dir = '/root/projects/VEX.RELEASE/src'
    files = glob.glob(os.path.join(src_dir, '**/*.ts'), recursive=True)
    files += glob.glob(os.path.join(src_dir, '**/*.tsx'), recursive=True)
    files = sorted(set(files))
    
    total_changes = 0
    files_changed = 0
    
    for filepath in files:
        changes = fix_file(filepath)
        if changes > 0:
            rel = os.path.relpath(filepath, '/root/projects/VEX.RELEASE')
            print(f'  {rel}: {changes} fix(es)')
            total_changes += changes
            files_changed += 1
    
    print(f'\nTotal: {total_changes} additional fixes across {files_changed} files')


if __name__ == '__main__':
    main()
