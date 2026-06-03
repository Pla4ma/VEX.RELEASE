import { task } from '@trigger.dev/sdk';
import { Sentry, initJobSentry } from '../shared/sentry';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

const FinalizeSeasonInputSchema = z.object({
  seasonId: z.string().uuid(),
});

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  initJobSentry();

export const finalizeSeasonTask = task({
  id: 'season-finalize',
  run: async (payload, io) => {
    const input = FinalizeSeasonInputSchema.parse(payload);

    const { data: progressRows, error: progressError } = await supabase
      .from('user_season_progress')
      .select('*')
      .eq('season_id', input.seasonId);

    if (progressError) {
      throw progressError;
    }

    for (const progress of progressRows ?? []) {
      await io.runTask(`archive-${progress.user_id}`, async () => {
        const rewardsClaimed = Array.isArray(progress.claimed_tiers) ? progress.claimed_tiers.length : 0;

        await supabase.from('season_history').insert({
          user_id: progress.user_id,
          season_id: input.seasonId,
          final_tier: progress.current_tier ?? 0,
          total_xp_earned: progress.total_season_xp ?? 0,
          rewards_claimed: rewardsClaimed,
          was_premium: progress.is_premium ?? false,
          completed_at: new Date().toISOString(),
        });
      });
    }

    const { error: seasonError } = await supabase
      .from('seasons')
      .update({
        is_active: false,
        archived_at: new Date().toISOString(),
      })
      .eq('id', input.seasonId);

    if (seasonError) {
      throw seasonError;
    }

    return {
      seasonId: input.seasonId,
      finalizedUsers: progressRows?.length ?? 0,
    };
  },
});

export default finalizeSeasonTask;
