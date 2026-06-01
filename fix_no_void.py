#!/usr/bin/env python3
"""Fix all no-void ESLint warnings in the VEX project.

Strategy: Match specific void OPERATOR patterns (not type annotations).
Operator patterns:
  1. Line starts with whitespace + void + identifier:  `    void expr`
  2. After {: `{void expr`
  3. After ;: `; void expr`
  4. After => in arrow body: `() => void expr`
  5. After (: `(void expr`
  6. After =: `= void expr`
  7. void 0: `void 0` -> `undefined`
"""
import re
import glob
import os


def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    lines = content.split('\n')
    new_lines = []
    changes = 0
    
    for line in lines:
        original = line
        
        # Find all void keyword positions (right to left to maintain positions)
        void_positions = [m.start() for m in re.finditer(r'\bvoid\b', line)]
        
        if not void_positions:
            new_lines.append(line)
            continue
        
        for pos in reversed(void_positions):
            before = line[:pos].rstrip()
            after = line[pos + 4:]  # after 'void'
            after_stripped = after.lstrip()
            
            is_operator = False
            
            # Pattern 1: void starts a statement (line starts with whitespace + void)
            if re.match(r'^\s*$', before):
                if after_stripped and (after_stripped[0].isalpha() or after_stripped[0] == '_' or after_stripped[0] == '0' or after_stripped[0:4] == 'this'):
                    is_operator = True
            
            # Pattern 2: void after {
            elif before.endswith('{'):
                if after_stripped and (after_stripped[0].isalpha() or after_stripped[0] == '_' or after_stripped[0:4] == 'this'):
                    is_operator = True
            
            # Pattern 3: void after ;
            elif before.endswith(';'):
                if after_stripped and (after_stripped[0].isalpha() or after_stripped[0] == '_' or after_stripped[0:4] == 'this'):
                    is_operator = True
            
            # Pattern 4: void after => (arrow function body, NOT type)
            elif re.search(r'=>\s*$', before):
                # In arrow body: void followed by identifier/call
                # In type: void followed by |, ;, }, ), etc.
                if after_stripped and (after_stripped[0].isalpha() or after_stripped[0] == '_' or after_stripped[0:4] == 'this'):
                    is_operator = True
            
            # Pattern 5: void after ( 
            elif before.endswith('('):
                if after_stripped and (after_stripped[0].isalpha() or after_stripped[0] == '_' or after_stripped[0:4] == 'this'):
                    is_operator = True
            
            # Pattern 6: void after = (assignment)
            elif before.endswith('='):
                if after_stripped and (after_stripped[0].isalpha() or after_stripped[0] == '_' or after_stripped[0:4] == 'this'):
                    is_operator = True
            
            if not is_operator:
                continue
            
            # Apply replacement
            # void 0 → undefined
            if re.match(r'\s+0\b', after):
                line = line[:pos] + 'undefined' + after.lstrip()[1:]
                changes += 1
                continue
            
            # void expression → expression (remove 'void ')
            if re.match(r'\s+\S', after):
                line = line[:pos] + after.lstrip()
                changes += 1
                continue
        
        new_lines.append(line)
    
    new_content = '\n'.join(new_lines)
    
    if changes > 0:
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
    
    print(f'\nTotal: {total_changes} fixes across {files_changed} files')


if __name__ == '__main__':
    main()
