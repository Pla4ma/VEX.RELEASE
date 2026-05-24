/**
 * ARCHITECTURE: src/ vs src_impl/
 *
 * VEX maintains two parallel directory trees:
 *
 *   src/       — FACADE LAYER (public API surface)
 *   src_impl/  — IMPLEMENTATION LAYER (all real code)
 *
 * Every file in src/ is a 1-2 line re-export of the corresponding file
 * in src_impl/. No implementation code lives in src/.
 *
 * RULES:
 * 1. ALL implementation code goes in src_impl/ — never src/.
 * 2. Every new module in src_impl/ MUST have a corresponding re-export
 *    in src/ if it's part of the public API.
 * 3. Import from src/ in cross-feature code (decouples from implementation).
 * 4. Import from src_impl/ within the same feature (avoids circular deps).
 * 5. If you're editing a file and it has more than 3 lines of actual code
 *    (not imports/exports), you're in the wrong layer — find src_impl/.
 * 6. Never create a new src/ file with implementation — it must be a
 *    pure re-export.
 *
 * WHY THIS EXISTS:
 * - src/ acts as a stable public API boundary
 * - src_impl/ can be refactored without breaking consumers
 * - Tooling can enforce that no implementation leaks into src/
 * - Clear separation prevents AI agents and humans from editing the wrong layer
 *
 * HOW TO VERIFY:
 *   # Check that all src/ files are pure re-exports (no implementation):
 *   rg -l "^export \* from" src/ | wc -l  # should match file count
 *
 *   # Find any implementation in src/ (violations):
 *   rg -l "^(?!export \* from).{20,}" src/
 */