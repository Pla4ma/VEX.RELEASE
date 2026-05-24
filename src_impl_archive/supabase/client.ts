/**
 * Supabase Client Export
 *
 * Re-exports the Supabase client from the config module
 * for backward compatibility with repository files.
 */

import { getSupabaseClient } from '../config/supabase';

// Export the supabase client instance
export const supabase = getSupabaseClient();

// Also export as default for convenience
export default supabase;
