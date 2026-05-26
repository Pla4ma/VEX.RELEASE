import type { SupabaseClient } from '@supabase/supabase-js';

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

type ChallengeRow = {
  user_id: string;
  challenge_id: string;
  current_value: number;
  expires_at: string;
  challenges: {
    title: string;
    target_value: number;
  } | null;
};

export async function scheduleChallengeExpiryNotifications(
  supabase: SupabaseClient,
  userId: string,
): Promise<void> {
  const now = new Date();
  const nextDay = new Date(now.getTime() + DAY_MS);
  const { data, error } = await supabase
    .from('user_challenges')
    .select('user_id, challenge_id, current_value, expires_at, challenges(title, target_value)')
    .eq('user_id', userId)
    .eq('status', 'ACTIVE')
    .gt('current_value', 0)
    .gt('expires_at', now.toISOString())
    .lt('expires_at', nextDay.toISOString());

  if (error) {
    throw error;
  }

  for (const row of (data ?? []) as ChallengeRow[]) {
    const title = row.challenges?.title;
    const targetValue = row.challenges?.target_value;
    if (!title || !targetValue) {
      continue;
    }

    const expiresAt = Date.parse(row.expires_at);
    const scheduledFor = Math.max(Date.now() + HOUR_MS, expiresAt - 3 * HOUR_MS);
    const { error: reminderError } = await supabase.from('reminder_plans').upsert(
      {
        id: crypto.randomUUID(),
        user_id: userId,
        reminder_type: 'RETENTION_CHALLENGE_EXPIRY',
        scheduled_for: scheduledFor,
        delivery_method: 'BOTH',
        status: 'SCHEDULED',
        context: {
          message: `${title} expires soon. Finish it before it resets.`,
          metadata: {
            challengeId: row.challenge_id,
            progress: row.current_value / targetValue,
            expiresAt,
          },
        },
        created_at: Date.now(),
        updated_at: Date.now(),
      },
      { onConflict: 'user_id,reminder_type' },
    );

    if (reminderError) {
      throw reminderError;
    }
  }
}
