/**
 * Supabase JS CJS loader shim
 *
 * Metro 0.84.4's ESM/CJS interop fails to extract named exports from the
 * Rolldown-bundled @supabase/supabase-js CJS file. The SHIMS map intercepts
 * resolution before package exports or resolveRequest logic runs.
 *
 * Metro transformer requires require() arguments to be string literals —
 * no variables, no path.resolve(). That's why this is a hardcoded relative path.
 */
'use strict';

// eslint-disable-next-line @typescript-eslint/no-require-imports
module.exports = require('../node_modules/@supabase/supabase-js/dist/index.cjs');
