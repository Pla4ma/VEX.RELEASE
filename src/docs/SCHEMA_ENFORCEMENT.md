/**
 * SCHEMA CHANGE ENFORCEMENT
 *
 * Every Supabase schema change MUST follow this exact sequence.
 * Skipping any step will cause schema drift — discrepancies between
 * migrations, the remote database, generated types, and repository code.
 *
 * MANDATORY SEQUENCE:
 *
 * 1. Write the migration
 *    supabase/migrations/<timestamp>_<description>.sql
 *
 * 2. Apply migration to local
 *    npx supabase db push
 *
 * 3. Regenerate types
 *    npm run types:supabase
 *    → Outputs src_impl/types/supabase.ts (~5,500 lines, auto-generated)
 *    → NEVER edit supabase.ts manually
 *
 * 4. Run typecheck
 *    npx tsc --noEmit
 *    → Fix all type errors before proceeding
 *
 * 5. Review RLS policies
 *    → Every table touched by the migration must have RLS enabled
 *    → Check that RLS policies allow correct user access
 *    → Test with a non-owner role
 *
 * 6. Update repository code
 *    → Add/modify repository functions in features/<name>/repository.ts
 *    → All queries must use the new generated types
 *    → Add error handling for new operations
 *
 * 7. Write at least one repository test
 *    → Verify the new operation works
 *    → Verify error cases are handled
 *
 * 8. Update delete-user behavior
 *    → If a new table stores user data, add it to the delete_user() function
 *    → Or use ON DELETE CASCADE in the migration
 *
 * 9. Update privacy policy coverage
 *    → If new data is collected, update privacy documentation
 *
 * 10. Migration to production
 *     → npx supabase db push (or CI pipeline)
 *     → Verify generated types still typecheck
 *     → Monitor for errors
 *
 * WHAT HAPPENS IF YOU SKIP STEPS:
 * - Skip step 3: Types are stale, bugs from mismatched column names/types
 * - Skip step 5: Data leaks — RLS is the last line of defense
 * - Skip step 6: Repository functions use wrong types, runtime errors
 * - Skip step 7: Bugs not caught, regressions in production
 * - Skip step 8: GDPR/CCPA violation — data not deleted when user requests
 *
 * VERIFICATION CHECKLIST (before merging any schema PR):
 * ☐ Migration file exists and is reversible
 * ☐ npm run types:supabase was run and file is committed
 * ☐ npx tsc --noEmit passes with zero errors
 * ☐ RLS is enabled on all new tables
 * ☐ RLS policies tested
 * ☐ Repository functions updated with new types
 * ☐ At least 1 test exists for new repository code
 * ☐ delete_user handles new tables
 */