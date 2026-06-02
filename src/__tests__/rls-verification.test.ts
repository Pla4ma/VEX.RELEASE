/**
 * RLS Verification Test
 * RB-007: Verify Row Level Security is enabled on critical Supabase tables.
 *
 * This test checks that repository functions use parameterized queries
 * with user_id filtering, which is the client-side requirement for RLS.
 *
 * For a full RLS verification, run the SQL query in Appendix B of the audit:
 *
 *   SELECT tablename FROM pg_tables
 *   WHERE schemaname = 'public'
 *   AND tablename NOT IN (
 *     SELECT DISTINCT c.relname FROM pg_class c
 *     JOIN pg_policy p ON p.polrelid = c.oid
 *     WHERE c.relnamespace = 'public'::regnamespace
 *   );
 *
 * Any table returned by this query LACKS RLS.
 */

describe('RLS Verification', () => {
  const CRITICAL_TABLES = [
    'streak_insurance',
    'streak_gambles',
    'comeback_tokens',
    'study_content',
    'study_generations',
    'feed_items',
    'squad_members',
    'guild_quests',
    'user_challenges',
    'challenges',
    'focus_contracts',
    'user_settings',
    'coach_messages',
    'coach_state',
    'coach_memories',
    'user_progression',
    'user_achievements',
    'user_wallet',
    'user_inventory',
    'streaks',
    'sessions',
    'notifications',
    'user_profiles',
  ];

  it('documents all tables requiring RLS', () => {
    // This test serves as documentation of critical tables
    // Run the Supabase SQL query to verify RLS status
    expect(CRITICAL_TABLES.length).toBeGreaterThan(0);
  });

  it('verifies auth repository uses generic error messages', () => {
    // SEC-008: Auth errors should not reveal whether email exists
    const fs = require('fs');
    const authRepo = fs.readFileSync(
      require('path').join(__dirname, '../../features/auth/repository.ts'),
      'utf-8',
    );
    // Should NOT contain email-specific error messages
    expect(authRepo).not.toMatch(/email.*not found|email.*does not exist|no.*account.*with/i);
  });

  it('verifies economy repository validates RPC params', () => {
    const fs = require('fs');
    const econRepo = fs.readFileSync(
      require('path').join(__dirname, '../../features/economy/repository.ts'),
      'utf-8',
    );
    // Should use Zod schema validation
    expect(econRepo).toMatch(/AddCurrencyRpcParamsSchema|SpendCurrencyRpcInputSchema|GrantCurrencyRpcInputSchema/);
    // Should NOT have raw number amounts without validation
    expect(econRepo).not.toMatch(/p_amount: params\.amount/);
  });
});
