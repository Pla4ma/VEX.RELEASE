# ARCHIVED HISTORICAL CODE

src_impl_archive is archived historical code. DO NOT:

- Edit any file here.
- Import any file from src_impl_archive into src/.
- Use src_impl_archive as source of truth for any feature.
- Target src_impl_archive in new work, tests, lint, or typecheck.

src/ is the only canonical implementation. All production imports, builds,
scans, and agent instructions must target src/. No runtime path may reference
src_impl_archive.

## Purpose

Preserved temporarily for rollback reference only. Not used at runtime.
Will be deleted when rollback confidence is confirmed.
