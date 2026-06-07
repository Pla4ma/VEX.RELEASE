import { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.103.3';

let cachedClient: SupabaseClient | null = null;

export function getRateLimitClient(
  supabaseUrl: string,
  serviceRoleKey: string,
): SupabaseClient {
  if (!cachedClient) {
    cachedClient = createClient(supabaseUrl, serviceRoleKey);
  }
  return cachedClient;
}

export function resetRateLimitClient(): void {
  cachedClient = null;
}
