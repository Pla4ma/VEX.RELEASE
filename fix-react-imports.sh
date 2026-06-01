#!/bin/bash
# Fix react/react-in-jsx-scope ESLint warnings
# Step 1: Disable the rule in .eslintrc.js (React 17+ JSX transform doesn't need it)
# Step 2: Remove unnecessary `import React` lines where React.* is not used

set -e
cd /root/projects/VEX.RELEASE

echo "=== Step 1: Adding 'react/react-in-jsx-scope': 'off' to .eslintrc.js ==="

# Add the rule to disable react-in-jsx-scope
if ! grep -q "'react/react-in-jsx-scope'" .eslintrc.js; then
  sed -i "s/'react-hooks\/rules-of-hooks': 'error',/'react-hooks\/rules-of-hooks': 'error',\n    'react\/react-in-jsx-scope': 'off',/" .eslintrc.js
  echo "  Added rule to .eslintrc.js"
else
  echo "  Rule already present in .eslintrc.js"
fi

echo ""
echo "=== Step 2: Removing unnecessary import React lines ==="

# Find all .tsx and .ts files in src/ that have `import React` 
REMOVED=0
KEPT=0
SKIPPED=0

while IFS= read -r file; do
  # Skip .md files
  [[ "$file" == *.md ]] && continue
  
  # Check if file has `import React from 'react'` (default only import)
  if grep -qE "^import React from 'react'" "$file"; then
    # Check if React. is used anywhere in the file besides the import line
    # Remove the import line first, then check
    rest_of_file=$(grep -v "^import React from 'react'" "$file")
    
    if echo "$rest_of_file" | grep -qE '\bReact\.'; then
      # React. is used in the file, keep the import
      KEPT=$((KEPT + 1))
      continue
    fi
    
    # Remove the import line
    sed -i "/^import React from 'react'/d" "$file"
    # Clean up resulting double blank lines
    sed -i '/^$/{ N; /^\n$/d; }' "$file"
    REMOVED=$((REMOVED + 1))
    
  elif grep -qE "^import React, \{.*\} from 'react'" "$file"; then
    # File has `import React, { ... } from 'react'`
    # Check if React. is used anywhere besides the import line
    rest_of_file=$(grep -v "^import React," "$file")
    
    if echo "$rest_of_file" | grep -qE '\bReact\.'; then
      # React. is used, keep the default import
      KEPT=$((KEPT + 1))
      continue
    fi
    
    # Replace `import React, { ... } from 'react'` with `import { ... } from 'react'`
    sed -i "s/^import React, \({[^}]*}\) from 'react'/import \1 from 'react'/" "$file"
    REMOVED=$((REMOVED + 1))
    
  else
    SKIPPED=$((SKIPPED + 1))
  fi
done < <(grep -rl "import React" src/ --include="*.tsx" --include="*.ts")

echo "  Removed/modified: $REMOVED files"
echo "  Kept (React.* used): $KEPT files"
echo "  Skipped: $SKIPPED files"

echo ""
echo "=== Step 3: Verify ==="
echo "Running eslint to check react-in-jsx-scope count..."
COUNT=$(npx eslint src/ 2>&1 | grep -c 'react-in-jsx-scope' || true)
echo "react-in-jsx-scope warnings remaining: $COUNT"
