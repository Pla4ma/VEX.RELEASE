import type { ContentStudyClient } from './supabase-client.ts';
import { getStudyContentAccess } from './study-access.ts';

export async function handleEligibility(
  supabase: ContentStudyClient,
  userId: string,
): Promise<Response> {
  try {
    const access = await getStudyContentAccess(supabase, userId);
    return new Response(
      JSON.stringify({ success: true, ...access }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: 'Could not verify Study access. Try again.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
