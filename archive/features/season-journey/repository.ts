/**
 * Season Journey Repository
 *
 * Data access layer for Season Journey progression system.
 * Replaces Battle Pass with simplified 20-30 milestone tracking.
 *
 * @phase 3
 */

import { supabase } from '../../api/supabase';
import { createDebugger } from '../../utils/debug';
import type {
  SeasonJourney,
  JourneyMilestone,
  UserJourney,
  UserJourneySummary,
  JourneySeason,
  SeasonSummary,
} from './types';

const debug = createDebugger('season-journey:repository');

// ============================================================================
// Types
// ============================================================================

interface SeasonJourneyRow {
  id: string;
  season_id: string;
  milestone_count: number;
  xp_per_milestone: number;
  theme: string | null;
  created_at: string;
  updated_at: string;
}

interface JourneyMilestoneRow {
  id: string;
  season_journey_id: string;
  milestone_number: number;
  xp_required: number;
  reward_id: string | null;
  reward_type: string | null;
  reward_amount: number | null;
  icon_url: string | null;
  is_major_milestone: boolean;
  name: string;
  description: string;
}

interface UserJourneyRow {
  id: string;
  user_id: string;
  season_journey_id: string;
  current_milestone: number;
  milestone_xp: number;
  total_xp: number;
  claimed_milestones: number[];
  created_at: string;
  updated_at: string;
}

interface JourneySeasonRow {
  id: string;
  name: string;
  theme: string;
  start_date: string;
  end_date: string;
  milestone_count: number;
  is_active: boolean;
  total_xp_required: number;
  created_at: string;
}

// ============================================================================
// Repository
// ============================================================================

export class SeasonJourneyRepository {
  private userId: string | null = null;

  setUserId(userId: string): void {
    this.userId = userId;
  }

  // ============================================================================
  // Season Journey Management
  // ============================================================================

  /**
   * Get active season journey
   */
  async getActiveSeasonJourney(): Promise<SeasonJourney | null> {
    try {
      const { data, error } = await supabase
        .from('journey_seasons')
        .select(`
          *,
          season_journeys!inner(
            id,
            season_id,
            milestone_count,
            xp_per_milestone,
            theme
          )
        `)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      if (!data) return null;

      const season = data as JourneySeasonRow & { season_journeys: SeasonJourneyRow[] };
      const journey = season.season_journeys[0];

      if (!journey) return null;

      return {
        id: journey.id,
        seasonId: journey.season_id,
        milestoneCount: journey.milestone_count,
        xpPerMilestone: journey.xp_per_milestone,
        theme: journey.theme,
        createdAt: new Date(journey.created_at).getTime(),
        startsAt: new Date(season.start_date).getTime(),
        endsAt: new Date(season.end_date).getTime(),
      };
    } catch (err) {
      const error = err as Error;
      debug.error('Failed to get active season journey:', error.message);
      throw error;
    }
  }

  /**
   * Get user's journey progress
   */
  async getUserJourney(seasonId: string): Promise<UserJourney | null> {
    if (!this.userId) throw new Error('User ID not set');

    try {
      const { data, error } = await supabase
        .from('user_journeys')
        .select(`
          *,
          season_journeys!inner(
            season_id,
            milestone_count,
            xp_per_milestone
          )
        `)
        .eq('user_id', this.userId)
        .eq('season_journeys.season_id', seasonId)
        .single();

      if (error) throw error;
      if (!data) return null;

      const row = data as UserJourneyRow & { season_journeys: SeasonJourneyRow[] };
      const journey = row.season_journeys[0];

      return {
        id: row.id,
        userId: row.user_id,
        seasonId: journey.season_id,
        currentMilestone: row.current_milestone,
        milestoneXp: row.milestone_xp,
        totalXp: row.total_xp,
        claimedMilestones: row.claimed_milestones || [],
        createdAt: new Date(row.created_at).getTime(),
        updatedAt: new Date(row.updated_at).getTime(),
      };
    } catch (err) {
      const error = err as Error;
      debug.error('Failed to get user journey:', error.message);
      throw error;
    }
  }

  /**
   * Get user journey summary with progress calculations
   */
  async getUserJourneySummary(seasonId: string): Promise<UserJourneySummary | null> {
    if (!this.userId) throw new Error('User ID not set');

    try {
      const { data, error } = await supabase
        .rpc('get_user_journey_progress', {
          p_user_id: this.userId,
        });

      if (error) throw error;
      if (!data || data.length === 0) return null;

      const progress = data[0];

      return {
        seasonId: progress.season_id,
        currentMilestone: progress.current_milestone,
        milestoneProgress: Math.round(progress.milestone_progress || 0),
        totalProgress: Math.round(progress.total_progress || 0),
        canClaim: progress.current_milestone > 0 && 
          !progress.claimed_milestones?.includes(progress.current_milestone),
        unclaimedMilestones: this.calculateUnclaimedMilestones(
          progress.current_milestone,
          progress.claimed_milestones || []
        ),
        nextMilestoneUnlocked: progress.milestone_progress >= 100,
        xpToNextMilestone: progress.xp_to_next_milestone || 0,
        daysRemaining: Math.max(0, progress.days_remaining || 0),
      };
    } catch (err) {
      const error = err as Error;
      debug.error('Failed to get user journey summary:', error.message);
      throw error;
    }
  }

  /**
   * Get all milestones for a season
   */
  async getSeasonMilestones(seasonId: string): Promise<JourneyMilestone[]> {
    try {
      const { data, error } = await supabase
        .from('journey_milestones')
        .select('*')
        .eq('season_journey_id', seasonId)
        .order('milestone_number', { ascending: true });

      if (error) throw error;

      return (data || []).map((row: JourneyMilestoneRow) => ({
        id: row.id,
        seasonId: seasonId,
        milestoneNumber: row.milestone_number,
        xpRequired: row.xp_required,
        rewardId: row.reward_id,
        rewardType: row.reward_type as any,
        rewardAmount: row.reward_amount,
        iconUrl: row.icon_url,
        isMajorMilestone: row.is_major_milestone,
        name: row.name,
        description: row.description,
      }));
    } catch (err) {
      const error = err as Error;
      debug.error('Failed to get season milestones:', error.message);
      throw error;
    }
  }

  /**
   * Add XP to user's journey progress
   */
  async addJourneyXp(seasonId: string, xpAmount: number): Promise<void> {
    if (!this.userId) throw new Error('User ID not set');

    try {
      const { error } = await supabase.rpc('add_journey_xp', {
        p_user_id: this.userId,
        p_season_id: seasonId,
        p_xp_amount: xpAmount,
      });

      if (error) throw error;

      debug.info('Journey XP added', { userId: this.userId, seasonId, xpAmount });
    } catch (err) {
      const error = err as Error;
      debug.error('Failed to add journey XP:', error.message);
      throw error;
    }
  }

  /**
   * Claim a milestone reward
   */
  async claimMilestone(seasonId: string, milestoneNumber: number): Promise<boolean> {
    if (!this.userId) throw new Error('User ID not set');

    try {
      // Get season journey ID
      const seasonJourney = await this.getSeasonJourneyBySeasonId(seasonId);
      if (!seasonJourney) return false;

      const { data, error } = await supabase.rpc('claim_journey_milestone', {
        p_user_id: this.userId,
        p_season_journey_id: seasonJourney.id,
        p_milestone_number: milestoneNumber,
      });

      if (error) throw error;

      const success = data as boolean;
      if (success) {
        debug.info('Milestone claimed', { userId: this.userId, seasonId, milestoneNumber });
      }

      return success;
    } catch (err) {
      const error = err as Error;
      debug.error('Failed to claim milestone:', error.message);
      throw error;
    }
  }

  /**
   * Get season summary with user progress
   */
  async getSeasonSummary(): Promise<SeasonSummary> {
    try {
      const activeSeason = await this.getActiveSeasonJourney();
      const userSummary = activeSeason 
        ? await this.getUserJourneySummary(activeSeason.seasonId)
        : null;

      // Get next season
      const { data: nextSeasons, error: nextError } = await supabase
        .from('journey_seasons')
        .select('*')
        .gt('start_date', new Date().toISOString())
        .order('start_date', { ascending: true })
        .limit(1);

      if (nextError) throw nextError;

      return {
        activeSeason,
        nextSeason: nextSeasons?.[0] ? this.mapSeasonRow(nextSeasons[0]) : null,
        userProgress: userSummary,
        daysUntilNextSeason: nextSeasons?.[0] 
          ? Math.ceil((new Date(nextSeasons[0].start_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : null,
      };
    } catch (err) {
      const error = err as Error;
      debug.error('Failed to get season summary:', error.message);
      throw error;
    }
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  private async getSeasonJourneyBySeasonId(seasonId: string): Promise<SeasonJourney | null> {
    const { data, error } = await supabase
      .from('season_journeys')
      .select('*')
      .eq('season_id', seasonId)
      .single();

    if (error) throw error;
    if (!data) return null;

    const row = data as SeasonJourneyRow;
    return {
      id: row.id,
      seasonId: row.season_id,
      milestoneCount: row.milestone_count,
      xpPerMilestone: row.xp_per_milestone,
      theme: row.theme,
      createdAt: new Date(row.created_at).getTime(),
      startsAt: 0, // Would need to join with seasons table
      endsAt: 0,
    };
  }

  private mapSeasonRow(row: JourneySeasonRow): JourneySeason {
    return {
      id: row.id,
      name: row.name,
      theme: row.theme,
      startDate: new Date(row.start_date).getTime(),
      endDate: new Date(row.end_date).getTime(),
      milestoneCount: row.milestone_count,
      isActive: row.is_active,
      totalXpRequired: row.total_xp_required,
    };
  }

  private calculateUnclaimedMilestones(
    currentMilestone: number,
    claimedMilestones: number[]
  ): number {
    let count = 0;
    for (let i = 1; i <= currentMilestone; i++) {
      if (!claimedMilestones.includes(i)) {
        count++;
      }
    }
    return count;
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let repository: SeasonJourneyRepository | null = null;

export function getSeasonJourneyRepository(): SeasonJourneyRepository {
  if (!repository) {
    repository = new SeasonJourneyRepository();
  }
  return repository;
}

export function resetSeasonJourneyRepository(): void {
  repository = null;
}
