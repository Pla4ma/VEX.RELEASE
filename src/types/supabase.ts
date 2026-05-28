export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activity_feed: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          granted_at: string | null
          granted_by: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          granted_at?: string | null
          granted_by?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          granted_at?: string | null
          granted_by?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: []
      }
      aggregated_stats: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      ai_quota_log: {
        Row: {
          category: string
          created_at: string
          id: string
          token_count: number
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          token_count?: number
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          token_count?: number
          user_id?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      analytics_preferences: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      battle_pass_tiers: {
        Row: {
          created_at: string | null
          free_reward_amount: number | null
          free_reward_item_id: string | null
          free_reward_type: string | null
          icon_url: string | null
          id: string
          is_major_milestone: boolean | null
          premium_reward_amount: number | null
          premium_reward_item_id: string | null
          premium_reward_type: string | null
          season_id: string
          tier_number: number
          xp_required: number
        }
        Insert: {
          created_at?: string | null
          free_reward_amount?: number | null
          free_reward_item_id?: string | null
          free_reward_type?: string | null
          icon_url?: string | null
          id?: string
          is_major_milestone?: boolean | null
          premium_reward_amount?: number | null
          premium_reward_item_id?: string | null
          premium_reward_type?: string | null
          season_id: string
          tier_number: number
          xp_required: number
        }
        Update: {
          created_at?: string | null
          free_reward_amount?: number | null
          free_reward_item_id?: string | null
          free_reward_type?: string | null
          icon_url?: string | null
          id?: string
          is_major_milestone?: boolean | null
          premium_reward_amount?: number | null
          premium_reward_item_id?: string | null
          premium_reward_type?: string | null
          season_id?: string
          tier_number?: number
          xp_required?: number
        }
        Relationships: [
          {
            foreignKeyName: "battle_pass_tiers_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      battle_passes: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      behavior_profiles: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      behavior_signals: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      boss_cooldowns: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      boss_defeat_history: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      boss_encounters: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      boss_templates: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      challenge_rerolls: {
        Row: {
          gems_spent: number | null
          id: string
          new_challenge_id: string | null
          original_challenge_id: string | null
          reroll_type: string | null
          rerolled_at: string | null
          user_id: string
        }
        Insert: {
          gems_spent?: number | null
          id?: string
          new_challenge_id?: string | null
          original_challenge_id?: string | null
          reroll_type?: string | null
          rerolled_at?: string | null
          user_id: string
        }
        Update: {
          gems_spent?: number | null
          id?: string
          new_challenge_id?: string | null
          original_challenge_id?: string | null
          reroll_type?: string | null
          rerolled_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_rerolls_new_challenge_id_fkey"
            columns: ["new_challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_rerolls_original_challenge_id_fkey"
            columns: ["original_challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_templates: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      challenges: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          end_at: string | null
          id: string
          is_active: boolean | null
          reward_amount: number | null
          reward_item_id: string | null
          reward_type: string | null
          season_id: string
          start_at: string | null
          target_type: string
          target_value: number
          title: string
          type: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          end_at?: string | null
          id?: string
          is_active?: boolean | null
          reward_amount?: number | null
          reward_item_id?: string | null
          reward_type?: string | null
          season_id: string
          start_at?: string | null
          target_type: string
          target_value: number
          title: string
          type: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          end_at?: string | null
          id?: string
          is_active?: boolean | null
          reward_amount?: number | null
          reward_item_id?: string | null
          reward_type?: string | null
          season_id?: string
          start_at?: string | null
          target_type?: string
          target_value?: number
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenges_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      chests: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      circle_activities: {
        Row: {
          circle_id: string | null
          created_at: string | null
          data: Json
          id: string
          type: string
          user_id: string | null
        }
        Insert: {
          circle_id?: string | null
          created_at?: string | null
          data?: Json
          id?: string
          type: string
          user_id?: string | null
        }
        Update: {
          circle_id?: string | null
          created_at?: string | null
          data?: Json
          id?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "circle_activities_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "study_circles"
            referencedColumns: ["id"]
          },
        ]
      }
      circle_invites: {
        Row: {
          circle_id: string | null
          created_at: string | null
          expires_at: string
          id: string
          invited_by_user_id: string | null
          invited_user_id: string | null
          status: string
        }
        Insert: {
          circle_id?: string | null
          created_at?: string | null
          expires_at?: string
          id?: string
          invited_by_user_id?: string | null
          invited_user_id?: string | null
          status?: string
        }
        Update: {
          circle_id?: string | null
          created_at?: string | null
          expires_at?: string
          id?: string
          invited_by_user_id?: string | null
          invited_user_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "circle_invites_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "study_circles"
            referencedColumns: ["id"]
          },
        ]
      }
      circle_members: {
        Row: {
          circle_id: string | null
          id: string
          is_active: boolean | null
          joined_at: string | null
          last_active_at: string | null
          permissions: string[] | null
          role: string
          sessions_completed: number
          streak_days: number
          total_focus_time: number
          user_id: string | null
          weekly_contribution: number
        }
        Insert: {
          circle_id?: string | null
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          last_active_at?: string | null
          permissions?: string[] | null
          role?: string
          sessions_completed?: number
          streak_days?: number
          total_focus_time?: number
          user_id?: string | null
          weekly_contribution?: number
        }
        Update: {
          circle_id?: string | null
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          last_active_at?: string | null
          permissions?: string[] | null
          role?: string
          sessions_completed?: number
          streak_days?: number
          total_focus_time?: number
          user_id?: string | null
          weekly_contribution?: number
        }
        Relationships: [
          {
            foreignKeyName: "circle_members_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "study_circles"
            referencedColumns: ["id"]
          },
        ]
      }
      circle_weekly_checks: {
        Row: {
          all_members_met_goal: boolean | null
          circle_id: string | null
          created_at: string | null
          id: string
          member_goals: Json
          percent_complete: number | null
          total_actual_minutes: number
          total_goal_minutes: number
          updated_at: string | null
          week_end: string
          week_start: string
        }
        Insert: {
          all_members_met_goal?: boolean | null
          circle_id?: string | null
          created_at?: string | null
          id?: string
          member_goals?: Json
          percent_complete?: number | null
          total_actual_minutes?: number
          total_goal_minutes?: number
          updated_at?: string | null
          week_end: string
          week_start: string
        }
        Update: {
          all_members_met_goal?: boolean | null
          circle_id?: string | null
          created_at?: string | null
          id?: string
          member_goals?: Json
          percent_complete?: number | null
          total_actual_minutes?: number
          total_goal_minutes?: number
          updated_at?: string | null
          week_end?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "circle_weekly_checks_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "study_circles"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_memories: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          description: string
          evidence_hash: string | null
          id: string
          last_referenced_at: string | null
          metadata: Json | null
          occurred_at: string
          referenced_count: number | null
          title: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          description: string
          evidence_hash?: string | null
          id?: string
          last_referenced_at?: string | null
          metadata?: Json | null
          occurred_at?: string
          referenced_count?: number | null
          title: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          description?: string
          evidence_hash?: string | null
          id?: string
          last_referenced_at?: string | null
          metadata?: Json | null
          occurred_at?: string
          referenced_count?: number | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      coach_message_templates: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      coach_messages: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      coach_personas: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      coach_quests: {
        Row: {
          completed: boolean | null
          created_at: string | null
          description: string
          expires_at: string
          id: string
          progress: number | null
          requirement_type: string
          requirement_value: number
          reward_coins: number
          reward_item_id: string | null
          reward_xp: number | null
          title: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          description: string
          expires_at: string
          id?: string
          progress?: number | null
          requirement_type: string
          requirement_value: number
          reward_coins: number
          reward_item_id?: string | null
          reward_xp?: number | null
          title: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          description?: string
          expires_at?: string
          id?: string
          progress?: number | null
          requirement_type?: string
          requirement_value?: number
          reward_coins?: number
          reward_item_id?: string | null
          reward_xp?: number | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      coach_states: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      comeback_plans: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      comeback_quests: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      comeback_tokens: {
        Row: {
          created_at: string | null
          earned_at: string | null
          id: string
          restore_value: number | null
          source_streak: number
          used: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          earned_at?: string | null
          id?: string
          restore_value?: number | null
          source_streak: number
          used?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          earned_at?: string | null
          id?: string
          restore_value?: number | null
          source_streak?: number
          used?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      companion_memories: {
        Row: {
          body: string
          created_at: string
          grade: string | null
          id: string
          purity_score: number | null
          session_date: string
          session_id: string | null
          streak_day: number | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          grade?: string | null
          id?: string
          purity_score?: number | null
          session_date: string
          session_id?: string | null
          streak_day?: number | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          grade?: string | null
          id?: string
          purity_score?: number | null
          session_date?: string
          session_id?: string | null
          streak_day?: number | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "companion_memories_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "user_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      companion_promises: {
        Row: {
          copy_seed: Json
          created_at: string
          fulfilled_at: string | null
          fulfilled_session_id: string | null
          id: string
          missed_at: string | null
          promised_for: string
          recommended_duration_minutes: number
          recommended_mode: string
          recovery_session_id: string | null
          source_session_id: string | null
          status: string
          target_date: string
          target_duration_minutes: number
          target_mode: string
          updated_at: string
          user_id: string
          window_end: string
          window_start: string
        }
        Insert: {
          copy_seed?: Json
          created_at?: string
          fulfilled_at?: string | null
          fulfilled_session_id?: string | null
          id?: string
          missed_at?: string | null
          promised_for: string
          recommended_duration_minutes: number
          recommended_mode: string
          recovery_session_id?: string | null
          source_session_id?: string | null
          status?: string
          target_date: string
          target_duration_minutes: number
          target_mode: string
          updated_at?: string
          user_id: string
          window_end: string
          window_start: string
        }
        Update: {
          copy_seed?: Json
          created_at?: string
          fulfilled_at?: string | null
          fulfilled_session_id?: string | null
          id?: string
          missed_at?: string | null
          promised_for?: string
          recommended_duration_minutes?: number
          recommended_mode?: string
          recovery_session_id?: string | null
          source_session_id?: string | null
          status?: string
          target_date?: string
          target_duration_minutes?: number
          target_mode?: string
          updated_at?: string
          user_id?: string
          window_end?: string
          window_start?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      currency_conversions: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      daily_dungeons: {
        Row: {
          base_health: number
          bonus_rewards: Json | null
          boss_id: string
          boss_name: string
          created_at: string | null
          date: string
          guaranteed_reward: Json
          id: string
          special_mechanic: string
          theme: string
          time_limit_minutes: number | null
        }
        Insert: {
          base_health: number
          bonus_rewards?: Json | null
          boss_id: string
          boss_name: string
          created_at?: string | null
          date: string
          guaranteed_reward: Json
          id?: string
          special_mechanic: string
          theme: string
          time_limit_minutes?: number | null
        }
        Update: {
          base_health?: number
          bonus_rewards?: Json | null
          boss_id?: string
          boss_name?: string
          created_at?: string | null
          date?: string
          guaranteed_reward?: Json
          id?: string
          special_mechanic?: string
          theme?: string
          time_limit_minutes?: number | null
        }
        Relationships: []
      }
      daily_reward_claims: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      dashboard_layouts: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      dashboard_widgets: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      detected_patterns: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      difficulty_preferences: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      difficulty_profiles: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      drop_tables: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      export_jobs: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          emergency_disabled_at: string | null
          emergency_disabled_by: string | null
          emergency_reason: string | null
          enabled: boolean | null
          id: string
          key: string
          requires_auth: boolean | null
          rollout_percentage: number | null
          target_user_ids: string[] | null
          target_user_segments: string[] | null
          updated_at: string | null
        }
        Insert: {
          emergency_disabled_at?: string | null
          emergency_disabled_by?: string | null
          emergency_reason?: string | null
          enabled?: boolean | null
          id?: string
          key: string
          requires_auth?: boolean | null
          rollout_percentage?: number | null
          target_user_ids?: string[] | null
          target_user_segments?: string[] | null
          updated_at?: string | null
        }
        Update: {
          emergency_disabled_at?: string | null
          emergency_disabled_by?: string | null
          emergency_reason?: string | null
          enabled?: boolean | null
          id?: string
          key?: string
          requires_auth?: boolean | null
          rollout_percentage?: number | null
          target_user_ids?: string[] | null
          target_user_segments?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      feed_likes: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      feed_reactions: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      first_week_progress: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      focus_contracts: {
        Row: {
          completion_status: string | null
          created_at: string
          id: string
          reflection_at: string | null
          session_id: string
          task_description: string
          user_id: string
        }
        Insert: {
          completion_status?: string | null
          created_at?: string
          id?: string
          reflection_at?: string | null
          session_id: string
          task_description: string
          user_id: string
        }
        Update: {
          completion_status?: string | null
          created_at?: string
          id?: string
          reflection_at?: string | null
          session_id?: string
          task_description?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "focus_contracts_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "user_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      focus_identity_profiles: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      focus_monthly_reports: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      focus_score_current: {
        Row: {
          band: string
          created_at: string
          current_score: number
          factors: Json
          id: string
          last_change_reason: string
          previous_score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          band: string
          created_at?: string
          current_score: number
          factors: Json
          id?: string
          last_change_reason: string
          previous_score: number
          updated_at?: string
          user_id: string
        }
        Update: {
          band?: string
          created_at?: string
          current_score?: number
          factors?: Json
          id?: string
          last_change_reason?: string
          previous_score?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      focus_score_history: {
        Row: {
          created_at: string
          delta: number
          id: string
          occurred_at: string
          reason: string
          score: number
          user_id: string
        }
        Insert: {
          created_at?: string
          delta: number
          id?: string
          occurred_at: string
          reason: string
          score: number
          user_id: string
        }
        Update: {
          created_at?: string
          delta?: number
          id?: string
          occurred_at?: string
          reason?: string
          score?: number
          user_id?: string
        }
        Relationships: []
      }
      focus_scores: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      friend_requests: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      friends: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      insights: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      intervention_executions: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      intervention_rules: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      item_definitions: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      journey_milestones: {
        Row: {
          created_at: string | null
          description: string
          icon_url: string | null
          id: string
          is_major_milestone: boolean | null
          milestone_number: number
          name: string
          reward_amount: number | null
          reward_id: string | null
          reward_type: string | null
          season_journey_id: string | null
          xp_required: number
        }
        Insert: {
          created_at?: string | null
          description: string
          icon_url?: string | null
          id?: string
          is_major_milestone?: boolean | null
          milestone_number: number
          name: string
          reward_amount?: number | null
          reward_id?: string | null
          reward_type?: string | null
          season_journey_id?: string | null
          xp_required: number
        }
        Update: {
          created_at?: string | null
          description?: string
          icon_url?: string | null
          id?: string
          is_major_milestone?: boolean | null
          milestone_number?: number
          name?: string
          reward_amount?: number | null
          reward_id?: string | null
          reward_type?: string | null
          season_journey_id?: string | null
          xp_required?: number
        }
        Relationships: [
          {
            foreignKeyName: "journey_milestones_season_journey_id_fkey"
            columns: ["season_journey_id"]
            isOneToOne: false
            referencedRelation: "season_journeys"
            referencedColumns: ["id"]
          },
        ]
      }
      journey_progress: {
        Row: {
          claimed_rewards: string[] | null
          completed_nodes: string[] | null
          current_node_id: string
          current_path: string
          id: string
          is_premium: boolean | null
          path_switch_history: Json | null
          path_xp_balanced: number | null
          path_xp_purity: number | null
          path_xp_social: number | null
          path_xp_speed: number | null
          premium_purchased_at: string | null
          season_id: string
          started_at: string | null
          total_xp: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          claimed_rewards?: string[] | null
          completed_nodes?: string[] | null
          current_node_id: string
          current_path: string
          id?: string
          is_premium?: boolean | null
          path_switch_history?: Json | null
          path_xp_balanced?: number | null
          path_xp_purity?: number | null
          path_xp_social?: number | null
          path_xp_speed?: number | null
          premium_purchased_at?: string | null
          season_id: string
          started_at?: string | null
          total_xp?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          claimed_rewards?: string[] | null
          completed_nodes?: string[] | null
          current_node_id?: string
          current_path?: string
          id?: string
          is_premium?: boolean | null
          path_switch_history?: Json | null
          path_xp_balanced?: number | null
          path_xp_purity?: number | null
          path_xp_social?: number | null
          path_xp_speed?: number | null
          premium_purchased_at?: string | null
          season_id?: string
          started_at?: string | null
          total_xp?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      journey_seasons: {
        Row: {
          created_at: string | null
          end_date: string
          id: string
          is_active: boolean | null
          milestone_count: number
          name: string
          start_date: string
          theme: string
          total_xp_required: number
        }
        Insert: {
          created_at?: string | null
          end_date: string
          id: string
          is_active?: boolean | null
          milestone_count?: number
          name: string
          start_date: string
          theme: string
          total_xp_required: number
        }
        Update: {
          created_at?: string | null
          end_date?: string
          id?: string
          is_active?: boolean | null
          milestone_count?: number
          name?: string
          start_date?: string
          theme?: string
          total_xp_required?: number
        }
        Relationships: []
      }
      level_up_history: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      limited_offers: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      liveops_config: {
        Row: {
          active_from: string | null
          active_until: string | null
          applies_to_seasons: string[] | null
          applies_to_users: string[] | null
          description: string | null
          id: string
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
          value_type: string | null
        }
        Insert: {
          active_from?: string | null
          active_until?: string | null
          applies_to_seasons?: string[] | null
          applies_to_users?: string[] | null
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
          value_type?: string | null
        }
        Update: {
          active_from?: string | null
          active_until?: string | null
          applies_to_seasons?: string[] | null
          applies_to_users?: string[] | null
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
          value_type?: string | null
        }
        Relationships: []
      }
      mastery_tracks: {
        Row: {
          boss_level: number | null
          boss_total_xp: number | null
          boss_xp: number | null
          comeback_level: number | null
          comeback_total_xp: number | null
          comeback_xp: number | null
          consistency_level: number | null
          consistency_total_xp: number | null
          consistency_xp: number | null
          created_at: string | null
          duration_level: number | null
          duration_total_xp: number | null
          duration_xp: number | null
          id: string
          overall_level: number | null
          overall_rank: string | null
          purity_level: number | null
          purity_total_xp: number | null
          purity_xp: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          boss_level?: number | null
          boss_total_xp?: number | null
          boss_xp?: number | null
          comeback_level?: number | null
          comeback_total_xp?: number | null
          comeback_xp?: number | null
          consistency_level?: number | null
          consistency_total_xp?: number | null
          consistency_xp?: number | null
          created_at?: string | null
          duration_level?: number | null
          duration_total_xp?: number | null
          duration_xp?: number | null
          id?: string
          overall_level?: number | null
          overall_rank?: string | null
          purity_level?: number | null
          purity_total_xp?: number | null
          purity_xp?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          boss_level?: number | null
          boss_total_xp?: number | null
          boss_xp?: number | null
          comeback_level?: number | null
          comeback_total_xp?: number | null
          comeback_xp?: number | null
          consistency_level?: number | null
          consistency_total_xp?: number | null
          consistency_xp?: number | null
          created_at?: string | null
          duration_level?: number | null
          duration_total_xp?: number | null
          duration_xp?: number | null
          id?: string
          overall_level?: number | null
          overall_rank?: string | null
          purity_level?: number | null
          purity_total_xp?: number | null
          purity_xp?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      mystery_multipliers: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          data: Json
          id: string
          read: boolean
          title: string | null
          type: string | null
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          data?: Json
          id?: string
          read?: boolean
          title?: string | null
          type?: string | null
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          data?: Json
          id?: string
          read?: boolean
          title?: string | null
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications_sent: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      personal_bests: {
        Row: {
          achieved_at: string
          best_grade: string
          best_purity_score: number
          duration_bucket: string
          id: string
          session_mode: string
          total_sessions: number
          updated_at: string
          user_id: string
        }
        Insert: {
          achieved_at?: string
          best_grade?: string
          best_purity_score?: number
          duration_bucket: string
          id?: string
          session_mode: string
          total_sessions?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          achieved_at?: string
          best_grade?: string
          best_purity_score?: number
          duration_bucket?: string
          id?: string
          session_mode?: string
          total_sessions?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      prestige_states: {
        Row: {
          active_bonuses: string[] | null
          created_at: string | null
          fastest_prestige_days: number | null
          first_prestige_at: string | null
          id: string
          last_prestige_at: string | null
          most_xp_at_prestige: number | null
          nightmare_completions: number | null
          nightmare_unlocked: boolean | null
          prestige_level: number | null
          total_prestiges: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          active_bonuses?: string[] | null
          created_at?: string | null
          fastest_prestige_days?: number | null
          first_prestige_at?: string | null
          id?: string
          last_prestige_at?: string | null
          most_xp_at_prestige?: number | null
          nightmare_completions?: number | null
          nightmare_unlocked?: boolean | null
          prestige_level?: number | null
          total_prestiges?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          active_bonuses?: string[] | null
          created_at?: string | null
          fastest_prestige_days?: number | null
          first_prestige_at?: string | null
          id?: string
          last_prestige_at?: string | null
          most_xp_at_prestige?: number | null
          nightmare_completions?: number | null
          nightmare_unlocked?: boolean | null
          prestige_level?: number | null
          total_prestiges?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      progression: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      purchase_attempts: {
        Row: {
          created_at: number
          error_code: string | null
          error_message: string | null
          id: string
          inventory_item_ids: string[] | null
          quantity: number
          refund_reason: string | null
          refunded_at: number | null
          shop_item_id: string | null
          status: string
          total_price_amount: number | null
          total_price_currency: string | null
          unit_price_amount: number | null
          unit_price_currency: string | null
          updated_at: number
          user_id: string
        }
        Insert: {
          created_at: number
          error_code?: string | null
          error_message?: string | null
          id?: string
          inventory_item_ids?: string[] | null
          quantity?: number
          refund_reason?: string | null
          refunded_at?: number | null
          shop_item_id?: string | null
          status: string
          total_price_amount?: number | null
          total_price_currency?: string | null
          unit_price_amount?: number | null
          unit_price_currency?: string | null
          updated_at: number
          user_id: string
        }
        Update: {
          created_at?: number
          error_code?: string | null
          error_message?: string | null
          id?: string
          inventory_item_ids?: string[] | null
          quantity?: number
          refund_reason?: string | null
          refunded_at?: number | null
          shop_item_id?: string | null
          status?: string
          total_price_amount?: number | null
          total_price_currency?: string | null
          unit_price_amount?: number | null
          unit_price_currency?: string | null
          updated_at?: number
          user_id?: string
        }
        Relationships: []
      }
      push_tokens: {
        Row: {
          created_at: string
          id: string
          platform: string
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          platform: string
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          platform?: string
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quick_use_slots: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      raid_participants: {
        Row: {
          completed_session: boolean | null
          damage_dealt: number | null
          id: string
          is_present: boolean | null
          is_ready: boolean | null
          joined_at: string | null
          purity_score: number | null
          raid_id: string
          rewards_received: Json | null
          session_duration: number | null
          session_ended_at: string | null
          session_id: string | null
          session_started_at: string | null
          user_id: string
        }
        Insert: {
          completed_session?: boolean | null
          damage_dealt?: number | null
          id?: string
          is_present?: boolean | null
          is_ready?: boolean | null
          joined_at?: string | null
          purity_score?: number | null
          raid_id: string
          rewards_received?: Json | null
          session_duration?: number | null
          session_ended_at?: string | null
          session_id?: string | null
          session_started_at?: string | null
          user_id: string
        }
        Update: {
          completed_session?: boolean | null
          damage_dealt?: number | null
          id?: string
          is_present?: boolean | null
          is_ready?: boolean | null
          joined_at?: string | null
          purity_score?: number | null
          raid_id?: string
          rewards_received?: Json | null
          session_duration?: number | null
          session_ended_at?: string | null
          session_id?: string | null
          session_started_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "raid_participants_raid_id_fkey"
            columns: ["raid_id"]
            isOneToOne: false
            referencedRelation: "squad_raids"
            referencedColumns: ["id"]
          },
        ]
      }
      realtime_duels: {
        Row: {
          accepted_at: string | null
          bet_amount: number | null
          boss_health: number
          boss_id: string
          boss_max_health: number
          challenger_completed: boolean | null
          challenger_damage: number | null
          challenger_id: string
          challenger_purity: number | null
          created_at: string | null
          current_leader: string | null
          duration: number
          ended_at: string | null
          events: Json | null
          id: string
          lead_changes: number | null
          mode: string
          opponent_completed: boolean | null
          opponent_damage: number | null
          opponent_id: string
          opponent_purity: number | null
          started_at: string | null
          status: string | null
          updated_at: string | null
          win_reason: string | null
          winner_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          bet_amount?: number | null
          boss_health: number
          boss_id: string
          boss_max_health: number
          challenger_completed?: boolean | null
          challenger_damage?: number | null
          challenger_id: string
          challenger_purity?: number | null
          created_at?: string | null
          current_leader?: string | null
          duration: number
          ended_at?: string | null
          events?: Json | null
          id?: string
          lead_changes?: number | null
          mode: string
          opponent_completed?: boolean | null
          opponent_damage?: number | null
          opponent_id: string
          opponent_purity?: number | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
          win_reason?: string | null
          winner_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          bet_amount?: number | null
          boss_health?: number
          boss_id?: string
          boss_max_health?: number
          challenger_completed?: boolean | null
          challenger_damage?: number | null
          challenger_id?: string
          challenger_purity?: number | null
          created_at?: string | null
          current_leader?: string | null
          duration?: number
          ended_at?: string | null
          events?: Json | null
          id?: string
          lead_changes?: number | null
          mode?: string
          opponent_completed?: boolean | null
          opponent_damage?: number | null
          opponent_id?: string
          opponent_purity?: number | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
          win_reason?: string | null
          winner_id?: string | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      refund_requests: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      reminder_plans: {
        Row: {
          context: Json
          created_at: number
          delivery_method: string
          id: string
          reminder_type: string
          scheduled_for: number
          status: string
          updated_at: number
          user_id: string
        }
        Insert: {
          context?: Json
          created_at: number
          delivery_method: string
          id?: string
          reminder_type: string
          scheduled_for: number
          status: string
          updated_at: number
          user_id: string
        }
        Update: {
          context?: Json
          created_at?: number
          delivery_method?: string
          id?: string
          reminder_type?: string
          scheduled_for?: number
          status?: string
          updated_at?: number
          user_id?: string
        }
        Relationships: []
      }
      rescue_completions: {
        Row: {
          completed_at: string
          created_at: string
          duration_seconds: number
          id: string
          lane: string
          next_recommendation: string
          outcome: string
          plan_id: string
          reason: string
          user_id: string
          worked: boolean
        }
        Insert: {
          completed_at?: string
          created_at?: string
          duration_seconds: number
          id: string
          lane: string
          next_recommendation: string
          outcome: string
          plan_id: string
          reason: string
          user_id: string
          worked?: boolean
        }
        Update: {
          completed_at?: string
          created_at?: string
          duration_seconds?: number
          id?: string
          lane?: string
          next_recommendation?: string
          outcome?: string
          plan_id?: string
          reason?: string
          user_id?: string
          worked?: boolean
        }
        Relationships: []
      }
      reward_deliveries: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      reward_ledger: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          delivered_at: string | null
          expires_at: string | null
          failed_reason: string | null
          id: string
          idempotency_key: string
          reward_type: string
          source_event: string
          status: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          currency?: string | null
          delivered_at?: string | null
          expires_at?: string | null
          failed_reason?: string | null
          id?: string
          idempotency_key: string
          reward_type: string
          source_event: string
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          delivered_at?: string | null
          expires_at?: string | null
          failed_reason?: string | null
          id?: string
          idempotency_key?: string
          reward_type?: string
          source_event?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      rewards: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      rivals: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      season_history: {
        Row: {
          challenges_completed: number | null
          completed_at: string | null
          final_tier: number
          id: string
          rewards_claimed: number | null
          season_id: string
          total_xp_earned: number
          user_id: string
          was_premium: boolean | null
        }
        Insert: {
          challenges_completed?: number | null
          completed_at?: string | null
          final_tier: number
          id?: string
          rewards_claimed?: number | null
          season_id: string
          total_xp_earned: number
          user_id: string
          was_premium?: boolean | null
        }
        Update: {
          challenges_completed?: number | null
          completed_at?: string | null
          final_tier?: number
          id?: string
          rewards_claimed?: number | null
          season_id?: string
          total_xp_earned?: number
          user_id?: string
          was_premium?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "season_history_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      season_journeys: {
        Row: {
          created_at: string | null
          id: string
          milestone_count: number
          season_id: string
          theme: string | null
          updated_at: string | null
          xp_per_milestone: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          milestone_count?: number
          season_id: string
          theme?: string | null
          updated_at?: string | null
          xp_per_milestone?: number
        }
        Update: {
          created_at?: string | null
          id?: string
          milestone_count?: number
          season_id?: string
          theme?: string | null
          updated_at?: string | null
          xp_per_milestone?: number
        }
        Relationships: []
      }
      seasons: {
        Row: {
          archived_at: string | null
          created_at: string | null
          description: string | null
          end_at: string
          id: string
          is_active: boolean | null
          name: string
          premium_price_gems: number
          start_at: string
          theme: string | null
          tier_count: number
          xp_per_tier: number
        }
        Insert: {
          archived_at?: string | null
          created_at?: string | null
          description?: string | null
          end_at: string
          id?: string
          is_active?: boolean | null
          name: string
          premium_price_gems?: number
          start_at: string
          theme?: string | null
          tier_count?: number
          xp_per_tier?: number
        }
        Update: {
          archived_at?: string | null
          created_at?: string | null
          description?: string | null
          end_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          premium_price_gems?: number
          start_at?: string
          theme?: string | null
          tier_count?: number
          xp_per_tier?: number
        }
        Relationships: []
      }
      session_completion_ledgers: {
        Row: {
          completed_at: number
          created_at: number
          idempotency_key: string
          ledger_id: string
          ledger_payload: Json
          offline_sync_status: string | null
          session_id: string
          user_id: string
        }
        Insert: {
          completed_at: number
          created_at?: number
          idempotency_key: string
          ledger_id?: string
          ledger_payload: Json
          offline_sync_status?: string | null
          session_id: string
          user_id: string
        }
        Update: {
          completed_at?: number
          created_at?: number
          idempotency_key?: string
          ledger_id?: string
          ledger_payload?: Json
          offline_sync_status?: string | null
          session_id?: string
          user_id?: string
        }
        Relationships: []
      }
      session_ledgers: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      session_recommendations: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      session_stories: {
        Row: {
          completion_rate: number
          created_at: number
          id: string
          session_id: string
          shared_at: number | null
          story_data: Json
          user_id: string
          viewed: boolean
          viewed_at: number | null
        }
        Insert: {
          completion_rate?: number
          created_at?: number
          id?: string
          session_id: string
          shared_at?: number | null
          story_data: Json
          user_id: string
          viewed?: boolean
          viewed_at?: number | null
        }
        Update: {
          completion_rate?: number
          created_at?: number
          id?: string
          session_id?: string
          shared_at?: number | null
          story_data?: Json
          user_id?: string
          viewed?: boolean
          viewed_at?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "session_stories_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          completed_at: string | null
          created_at: string
          difficulty: string | null
          duration: number
          effective_duration: number | null
          ended_at: string | null
          id: string
          metadata: Json
          mode: string | null
          quality_score: number | null
          started_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          difficulty?: string | null
          duration?: number
          effective_duration?: number | null
          ended_at?: string | null
          id?: string
          metadata?: Json
          mode?: string | null
          quality_score?: number | null
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          difficulty?: string | null
          duration?: number
          effective_duration?: number | null
          ended_at?: string | null
          id?: string
          metadata?: Json
          mode?: string | null
          quality_score?: number | null
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      squad_activities: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      squad_challenges: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      squad_invites: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      squad_join_requests: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      squad_members: {
        Row: {
          id: string
          is_active: boolean
          joined_at: string | null
          role: string | null
          squad_id: string
          user_id: string
        }
        Insert: {
          id?: string
          is_active?: boolean
          joined_at?: string | null
          role?: string | null
          squad_id: string
          user_id: string
        }
        Update: {
          id?: string
          is_active?: boolean
          joined_at?: string | null
          role?: string | null
          squad_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "squad_members_squad_id_fkey"
            columns: ["squad_id"]
            isOneToOne: false
            referencedRelation: "squads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "squad_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      squad_raids: {
        Row: {
          boss_health: number
          boss_max_health: number
          boss_phase: number | null
          created_at: string | null
          damage_log: Json | null
          ended_at: string | null
          id: string
          scheduled_for: string
          squad_id: string
          started_at: string | null
          status: string | null
          template_id: string
          time_slot: string
          total_damage_dealt: number | null
          updated_at: string | null
        }
        Insert: {
          boss_health: number
          boss_max_health: number
          boss_phase?: number | null
          created_at?: string | null
          damage_log?: Json | null
          ended_at?: string | null
          id?: string
          scheduled_for: string
          squad_id: string
          started_at?: string | null
          status?: string | null
          template_id: string
          time_slot: string
          total_damage_dealt?: number | null
          updated_at?: string | null
        }
        Update: {
          boss_health?: number
          boss_max_health?: number
          boss_phase?: number | null
          created_at?: string | null
          damage_log?: Json | null
          ended_at?: string | null
          id?: string
          scheduled_for?: string
          squad_id?: string
          started_at?: string | null
          status?: string | null
          template_id?: string
          time_slot?: string
          total_damage_dealt?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "squad_raids_squad_id_fkey"
            columns: ["squad_id"]
            isOneToOne: false
            referencedRelation: "squads"
            referencedColumns: ["id"]
          },
        ]
      }
      squad_session_participants: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      squad_sessions: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      squad_streaks: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      squad_synergy: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      squad_war_damage: {
        Row: {
          created_at: string
          damage: number
          id: string
          metadata: Json
          session_id: string
          squad_id: string
          user_id: string
          war_id: string
        }
        Insert: {
          created_at?: string
          damage: number
          id?: string
          metadata?: Json
          session_id: string
          squad_id: string
          user_id: string
          war_id: string
        }
        Update: {
          created_at?: string
          damage?: number
          id?: string
          metadata?: Json
          session_id?: string
          squad_id?: string
          user_id?: string
          war_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "squad_war_damage_squad_id_fkey"
            columns: ["squad_id"]
            isOneToOne: false
            referencedRelation: "squads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "squad_war_damage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "squad_war_damage_war_id_fkey"
            columns: ["war_id"]
            isOneToOne: false
            referencedRelation: "squad_wars"
            referencedColumns: ["id"]
          },
        ]
      }
      squad_wars: {
        Row: {
          boss_current_health: number
          boss_max_health: number
          boss_name: string
          created_at: string
          id: string
          opponent_squad_id: string | null
          reward_multiplier: number
          squad_id: string
          status: string
          week_ends_at: string
          week_starts_at: string
        }
        Insert: {
          boss_current_health: number
          boss_max_health: number
          boss_name: string
          created_at?: string
          id?: string
          opponent_squad_id?: string | null
          reward_multiplier?: number
          squad_id: string
          status?: string
          week_ends_at: string
          week_starts_at: string
        }
        Update: {
          boss_current_health?: number
          boss_max_health?: number
          boss_name?: string
          created_at?: string
          id?: string
          opponent_squad_id?: string | null
          reward_multiplier?: number
          squad_id?: string
          status?: string
          week_ends_at?: string
          week_starts_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "squad_wars_opponent_squad_id_fkey"
            columns: ["opponent_squad_id"]
            isOneToOne: false
            referencedRelation: "squads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "squad_wars_squad_id_fkey"
            columns: ["squad_id"]
            isOneToOne: false
            referencedRelation: "squads"
            referencedColumns: ["id"]
          },
        ]
      }
      squads: {
        Row: {
          avatar_url: string | null
          banner_url: string | null
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          is_public: boolean | null
          member_count: number | null
          name: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          banner_url?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          member_count?: number | null
          name: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          banner_url?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          member_count?: number | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "squads_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      stakes_sessions: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      streak_gambles: {
        Row: {
          actual_grade: string | null
          bonus_xp_if_won: number | null
          created_at: string | null
          id: string
          required_grade: string
          session_id: string | null
          settled_at: string | null
          started_at: string | null
          status: string | null
          streak_days_at_risk: number
          user_id: string
        }
        Insert: {
          actual_grade?: string | null
          bonus_xp_if_won?: number | null
          created_at?: string | null
          id?: string
          required_grade: string
          session_id?: string | null
          settled_at?: string | null
          started_at?: string | null
          status?: string | null
          streak_days_at_risk: number
          user_id: string
        }
        Update: {
          actual_grade?: string | null
          bonus_xp_if_won?: number | null
          created_at?: string | null
          id?: string
          required_grade?: string
          session_id?: string | null
          settled_at?: string | null
          started_at?: string | null
          status?: string | null
          streak_days_at_risk?: number
          user_id?: string
        }
        Relationships: []
      }
      streak_insurance: {
        Row: {
          cost: number
          created_at: string | null
          expires_at: string
          id: string
          purchased_at: string | null
          streak_days_protected: number
          used: boolean | null
          used_at: string | null
          user_id: string
        }
        Insert: {
          cost: number
          created_at?: string | null
          expires_at: string
          id?: string
          purchased_at?: string | null
          streak_days_protected: number
          used?: boolean | null
          used_at?: string | null
          user_id: string
        }
        Update: {
          cost?: number
          created_at?: string | null
          expires_at?: string
          id?: string
          purchased_at?: string | null
          streak_days_protected?: number
          used?: boolean | null
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      streak_repair_quests: {
        Row: {
          completed_at: number | null
          expires_at: number
          id: string
          previous_streak: number
          session_ids: string[]
          sessions_completed: number
          sessions_required: number
          started_at: number
          status: string
          target_restore_days: number
          updated_at: number | null
          user_id: string
        }
        Insert: {
          completed_at?: number | null
          expires_at: number
          id?: string
          previous_streak: number
          session_ids?: string[]
          sessions_completed?: number
          sessions_required: number
          started_at: number
          status: string
          target_restore_days: number
          updated_at?: number | null
          user_id: string
        }
        Update: {
          completed_at?: number | null
          expires_at?: number
          id?: string
          previous_streak?: number
          session_ids?: string[]
          sessions_completed?: number
          sessions_required?: number
          started_at?: number
          status?: string
          target_restore_days?: number
          updated_at?: number | null
          user_id?: string
        }
        Relationships: []
      }
      streak_risk_status: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      streak_shields: {
        Row: {
          created_at: number
          id: string
          source: string
          used: boolean
          used_at: number | null
          user_id: string
        }
        Insert: {
          created_at: number
          id?: string
          source: string
          used?: boolean
          used_at?: number | null
          user_id: string
        }
        Update: {
          created_at?: number
          id?: string
          source?: string
          used?: boolean
          used_at?: number | null
          user_id?: string
        }
        Relationships: []
      }
      streaks: {
        Row: {
          created_at: number
          current_day_completed_at: number | null
          current_days: number
          frozen_until: number | null
          grace_period_used: boolean
          id: string
          last_qualifying_session_at: number | null
          longest_days: number
          shields_available: number
          timezone: string
          updated_at: number
          user_id: string
        }
        Insert: {
          created_at: number
          current_day_completed_at?: number | null
          current_days?: number
          frozen_until?: number | null
          grace_period_used?: boolean
          id?: string
          last_qualifying_session_at?: number | null
          longest_days?: number
          shields_available?: number
          timezone?: string
          updated_at: number
          user_id: string
        }
        Update: {
          created_at?: number
          current_day_completed_at?: number | null
          current_days?: number
          frozen_until?: number | null
          grace_period_used?: boolean
          id?: string
          last_qualifying_session_at?: number | null
          longest_days?: number
          shields_available?: number
          timezone?: string
          updated_at?: number
          user_id?: string
        }
        Relationships: []
      }
      study_buddies: {
        Row: {
          accepted_at: string | null
          buddy_id: string | null
          created_at: string | null
          encouragements_received: number
          encouragements_sent: number
          end_reason: string | null
          ended_at: string | null
          id: string
          initiated_at: string | null
          initiated_by: string | null
          mutual_stats: Json | null
          shared_goal_id: string | null
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          buddy_id?: string | null
          created_at?: string | null
          encouragements_received?: number
          encouragements_sent?: number
          end_reason?: string | null
          ended_at?: string | null
          id?: string
          initiated_at?: string | null
          initiated_by?: string | null
          mutual_stats?: Json | null
          shared_goal_id?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          buddy_id?: string | null
          created_at?: string | null
          encouragements_received?: number
          encouragements_sent?: number
          end_reason?: string | null
          ended_at?: string | null
          id?: string
          initiated_at?: string | null
          initiated_by?: string | null
          mutual_stats?: Json | null
          shared_goal_id?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      study_buddy_check_ins: {
        Row: {
          buddy_pair_id: string | null
          completed_session: boolean | null
          created_at: string | null
          date: string
          id: string
          minutes_studied: number | null
          mood: string | null
          note: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          buddy_pair_id?: string | null
          completed_session?: boolean | null
          created_at?: string | null
          date: string
          id?: string
          minutes_studied?: number | null
          mood?: string | null
          note?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          buddy_pair_id?: string | null
          completed_session?: boolean | null
          created_at?: string | null
          date?: string
          id?: string
          minutes_studied?: number | null
          mood?: string | null
          note?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "study_buddy_check_ins_buddy_pair_id_fkey"
            columns: ["buddy_pair_id"]
            isOneToOne: false
            referencedRelation: "study_buddies"
            referencedColumns: ["id"]
          },
        ]
      }
      study_buddy_encouragements: {
        Row: {
          buddy_pair_id: string | null
          created_at: string | null
          from_user_id: string | null
          id: string
          message: string | null
          seen: boolean | null
          to_user_id: string | null
          type: string
        }
        Insert: {
          buddy_pair_id?: string | null
          created_at?: string | null
          from_user_id?: string | null
          id?: string
          message?: string | null
          seen?: boolean | null
          to_user_id?: string | null
          type: string
        }
        Update: {
          buddy_pair_id?: string | null
          created_at?: string | null
          from_user_id?: string | null
          id?: string
          message?: string | null
          seen?: boolean | null
          to_user_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_buddy_encouragements_buddy_pair_id_fkey"
            columns: ["buddy_pair_id"]
            isOneToOne: false
            referencedRelation: "study_buddies"
            referencedColumns: ["id"]
          },
        ]
      }
      study_buddy_shared_goals: {
        Row: {
          created_at: string | null
          description: string
          id: string
          metric: string
          target: number
          timeframe: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          metric: string
          target: number
          timeframe: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          metric?: string
          target?: number
          timeframe?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      study_circles: {
        Row: {
          avatar_url: string | null
          banner_url: string | null
          completed_sessions: number
          created_at: string | null
          created_by: string | null
          current_week_progress: number
          description: string | null
          id: string
          is_public: boolean | null
          join_requirements: string
          max_members: number
          member_count: number
          name: string
          total_focus_time: number
          updated_at: string | null
          weekly_goal_minutes: number
        }
        Insert: {
          avatar_url?: string | null
          banner_url?: string | null
          completed_sessions?: number
          created_at?: string | null
          created_by?: string | null
          current_week_progress?: number
          description?: string | null
          id?: string
          is_public?: boolean | null
          join_requirements?: string
          max_members?: number
          member_count?: number
          name: string
          total_focus_time?: number
          updated_at?: string | null
          weekly_goal_minutes?: number
        }
        Update: {
          avatar_url?: string | null
          banner_url?: string | null
          completed_sessions?: number
          created_at?: string | null
          created_by?: string | null
          current_week_progress?: number
          description?: string | null
          id?: string
          is_public?: boolean | null
          join_requirements?: string
          max_members?: number
          member_count?: number
          name?: string
          total_focus_time?: number
          updated_at?: string | null
          weekly_goal_minutes?: number
        }
        Relationships: []
      }
      study_content: {
        Row: {
          created_at: string
          deleted_at: string | null
          error_message: string | null
          extracted_at: string | null
          extracted_length: number
          extracted_text: string
          generation_count_today: number
          id: string
          is_user_edited: boolean
          language: string | null
          last_generation_date: string | null
          original_filename: string | null
          source_type: string
          source_url: string | null
          status: string
          storage_path: string | null
          title: string | null
          updated_at: string
          user_edited_text: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          error_message?: string | null
          extracted_at?: string | null
          extracted_length?: number
          extracted_text?: string
          generation_count_today?: number
          id?: string
          is_user_edited?: boolean
          language?: string | null
          last_generation_date?: string | null
          original_filename?: string | null
          source_type: string
          source_url?: string | null
          status?: string
          storage_path?: string | null
          title?: string | null
          updated_at?: string
          user_edited_text?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          error_message?: string | null
          extracted_at?: string | null
          extracted_length?: number
          extracted_text?: string
          generation_count_today?: number
          id?: string
          is_user_edited?: boolean
          language?: string | null
          last_generation_date?: string | null
          original_filename?: string | null
          source_type?: string
          source_url?: string | null
          status?: string
          storage_path?: string | null
          title?: string | null
          updated_at?: string
          user_edited_text?: string | null
          user_id?: string
        }
        Relationships: []
      }
      study_generations: {
        Row: {
          content_id: string
          created_at: string
          deleted_at: string | null
          generation_version: string
          id: string
          key_concepts: string[] | null
          last_used_at: string | null
          model: string
          processing_time_ms: number | null
          quiz_items: Json
          session_plan: Json
          summary: string | null
          tasks: Json
          times_used: number
          updated_at: string
          user_id: string
          user_rating: number | null
          was_helpful: boolean | null
        }
        Insert: {
          content_id: string
          created_at?: string
          deleted_at?: string | null
          generation_version?: string
          id?: string
          key_concepts?: string[] | null
          last_used_at?: string | null
          model?: string
          processing_time_ms?: number | null
          quiz_items?: Json
          session_plan?: Json
          summary?: string | null
          tasks?: Json
          times_used?: number
          updated_at?: string
          user_id: string
          user_rating?: number | null
          was_helpful?: boolean | null
        }
        Update: {
          content_id?: string
          created_at?: string
          deleted_at?: string | null
          generation_version?: string
          id?: string
          key_concepts?: string[] | null
          last_used_at?: string | null
          model?: string
          processing_time_ms?: number | null
          quiz_items?: Json
          session_plan?: Json
          summary?: string | null
          tasks?: Json
          times_used?: number
          updated_at?: string
          user_id?: string
          user_rating?: number | null
          was_helpful?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "study_generations_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "study_content"
            referencedColumns: ["id"]
          },
        ]
      }
      study_packs: {
        Row: {
          category: string | null
          color: string | null
          completed_tasks: number
          content_ids: string[] | null
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          is_completed: boolean
          last_studied_at: string | null
          tags: string[] | null
          title: string
          total_tasks: number
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          color?: string | null
          completed_tasks?: number
          content_ids?: string[] | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_completed?: boolean
          last_studied_at?: string | null
          tags?: string[] | null
          title: string
          total_tasks?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          color?: string | null
          completed_tasks?: number
          content_ids?: string[] | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_completed?: boolean
          last_studied_at?: string | null
          tags?: string[] | null
          title?: string
          total_tasks?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      "study-content": {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      synergy_activities: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      trading_listings: {
        Row: {
          buyer_id: string | null
          created_at: string | null
          expires_at: string
          id: string
          item_id: string
          listed_at: string | null
          price: number
          seller_id: string
          sold: boolean | null
          sold_at: string | null
        }
        Insert: {
          buyer_id?: string | null
          created_at?: string | null
          expires_at: string
          id?: string
          item_id: string
          listed_at?: string | null
          price: number
          seller_id: string
          sold?: boolean | null
          sold_at?: string | null
        }
        Update: {
          buyer_id?: string | null
          created_at?: string | null
          expires_at?: string
          id?: string
          item_id?: string
          listed_at?: string | null
          price?: number
          seller_id?: string
          sold?: boolean | null
          sold_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trading_listings_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "user_items"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          status: string
          type: string
          wallet_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          status?: string
          type: string
          wallet_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          status?: string
          type?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      unified_wallets: {
        Row: {
          coins: number | null
          created_at: string | null
          id: string
          tokens: number | null
          total_earned_coins: number | null
          total_earned_tokens: number | null
          total_spent_coins: number | null
          total_spent_tokens: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          coins?: number | null
          created_at?: string | null
          id?: string
          tokens?: number | null
          total_earned_coins?: number | null
          total_earned_tokens?: number | null
          total_spent_coins?: number | null
          total_spent_tokens?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          coins?: number | null
          created_at?: string | null
          id?: string
          tokens?: number | null
          total_earned_coins?: number | null
          total_earned_tokens?: number | null
          total_spent_coins?: number | null
          total_spent_tokens?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_battle_pass: {
        Row: {
          claimed_free_tiers: number[] | null
          claimed_premium_tiers: number[] | null
          created_at: string | null
          current_tier: number | null
          id: string
          is_premium: boolean | null
          premium_purchased_at: string | null
          season_id: string
          tier_xp: number | null
          total_xp: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          claimed_free_tiers?: number[] | null
          claimed_premium_tiers?: number[] | null
          created_at?: string | null
          current_tier?: number | null
          id?: string
          is_premium?: boolean | null
          premium_purchased_at?: string | null
          season_id: string
          tier_xp?: number | null
          total_xp?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          claimed_free_tiers?: number[] | null
          claimed_premium_tiers?: number[] | null
          created_at?: string | null
          current_tier?: number | null
          id?: string
          is_premium?: boolean | null
          premium_purchased_at?: string | null
          season_id?: string
          tier_xp?: number | null
          total_xp?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_battle_pass_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      user_challenges: {
        Row: {
          assigned_at: string | null
          challenge_id: string
          claimed_at: string | null
          completed_at: string | null
          created_at: string | null
          current_value: number | null
          expires_at: string | null
          id: string
          reroll_count: number | null
          status: string | null
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          challenge_id: string
          claimed_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          current_value?: number | null
          expires_at?: string | null
          id?: string
          reroll_count?: number | null
          status?: string | null
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          challenge_id?: string
          claimed_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          current_value?: number | null
          expires_at?: string | null
          id?: string
          reroll_count?: number | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_challenges_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_coach_preferences: {
        Row: {
          created_at: string | null
          daily_reminders_enabled: boolean | null
          id: string
          is_premium: boolean | null
          selected_persona: string | null
          session_prompts_enabled: boolean | null
          streak_warnings_enabled: boolean | null
          unlocked_personas: string[] | null
          updated_at: string | null
          user_id: string
          weekly_summary_enabled: boolean | null
        }
        Insert: {
          created_at?: string | null
          daily_reminders_enabled?: boolean | null
          id?: string
          is_premium?: boolean | null
          selected_persona?: string | null
          session_prompts_enabled?: boolean | null
          streak_warnings_enabled?: boolean | null
          unlocked_personas?: string[] | null
          updated_at?: string | null
          user_id: string
          weekly_summary_enabled?: boolean | null
        }
        Update: {
          created_at?: string | null
          daily_reminders_enabled?: boolean | null
          id?: string
          is_premium?: boolean | null
          selected_persona?: string | null
          session_prompts_enabled?: boolean | null
          streak_warnings_enabled?: boolean | null
          unlocked_personas?: string[] | null
          updated_at?: string | null
          user_id?: string
          weekly_summary_enabled?: boolean | null
        }
        Relationships: []
      }
      user_daily_rewards: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_dungeon_attempts: {
        Row: {
          attempts: number | null
          best_damage: number | null
          best_time_seconds: number | null
          claimed_rewards: string[] | null
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          date: string
          dungeon_id: string
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          attempts?: number | null
          best_damage?: number | null
          best_time_seconds?: number | null
          claimed_rewards?: string[] | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          date: string
          dungeon_id: string
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          attempts?: number | null
          best_damage?: number | null
          best_time_seconds?: number | null
          claimed_rewards?: string[] | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          date?: string
          dungeon_id?: string
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_dungeon_attempts_dungeon_id_fkey"
            columns: ["dungeon_id"]
            isOneToOne: false
            referencedRelation: "daily_dungeons"
            referencedColumns: ["id"]
          },
        ]
      }
      user_items: {
        Row: {
          created_at: string | null
          description: string | null
          durability: number | null
          equipped: boolean | null
          equipped_slot: string | null
          gems: Json | null
          id: string
          level: number | null
          max_durability: number | null
          max_level: number | null
          name: string
          rarity: string
          set_id: string | null
          sockets: number | null
          stats: Json | null
          template_id: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          durability?: number | null
          equipped?: boolean | null
          equipped_slot?: string | null
          gems?: Json | null
          id?: string
          level?: number | null
          max_durability?: number | null
          max_level?: number | null
          name: string
          rarity: string
          set_id?: string | null
          sockets?: number | null
          stats?: Json | null
          template_id: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          durability?: number | null
          equipped?: boolean | null
          equipped_slot?: string | null
          gems?: Json | null
          id?: string
          level?: number | null
          max_durability?: number | null
          max_level?: number | null
          name?: string
          rarity?: string
          set_id?: string | null
          sockets?: number | null
          stats?: Json | null
          template_id?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_journey_claims: {
        Row: {
          claimed_at: string | null
          id: string
          milestone_number: number
          reward_amount: number | null
          reward_type: string | null
          season_journey_id: string | null
          user_id: string | null
        }
        Insert: {
          claimed_at?: string | null
          id?: string
          milestone_number: number
          reward_amount?: number | null
          reward_type?: string | null
          season_journey_id?: string | null
          user_id?: string | null
        }
        Update: {
          claimed_at?: string | null
          id?: string
          milestone_number?: number
          reward_amount?: number | null
          reward_type?: string | null
          season_journey_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_journey_claims_season_journey_id_fkey"
            columns: ["season_journey_id"]
            isOneToOne: false
            referencedRelation: "season_journeys"
            referencedColumns: ["id"]
          },
        ]
      }
      user_journeys: {
        Row: {
          claimed_milestones: number[] | null
          created_at: string | null
          current_milestone: number
          id: string
          milestone_xp: number
          season_journey_id: string | null
          total_xp: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          claimed_milestones?: number[] | null
          created_at?: string | null
          current_milestone?: number
          id?: string
          milestone_xp?: number
          season_journey_id?: string | null
          total_xp?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          claimed_milestones?: number[] | null
          created_at?: string | null
          current_milestone?: number
          id?: string
          milestone_xp?: number
          season_journey_id?: string | null
          total_xp?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_journeys_season_journey_id_fkey"
            columns: ["season_journey_id"]
            isOneToOne: false
            referencedRelation: "season_journeys"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notification_settings: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_offer_claims: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_push_tokens: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_season_progress: {
        Row: {
          claimed_tiers: string[] | null
          created_at: string | null
          current_tier: number | null
          id: string
          is_premium: boolean | null
          premium_purchased_at: string | null
          season_id: string
          tier_xp: number | null
          total_season_xp: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          claimed_tiers?: string[] | null
          created_at?: string | null
          current_tier?: number | null
          id?: string
          is_premium?: boolean | null
          premium_purchased_at?: string | null
          season_id: string
          tier_xp?: number | null
          total_season_xp?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          claimed_tiers?: string[] | null
          created_at?: string | null
          current_tier?: number | null
          id?: string
          is_premium?: boolean | null
          premium_purchased_at?: string | null
          season_id?: string
          tier_xp?: number | null
          total_season_xp?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_season_progress_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          device_info: Json | null
          ended_at: string | null
          id: string
          ip_address: string | null
          is_active: boolean | null
          started_at: string | null
          user_id: string
        }
        Insert: {
          device_info?: Json | null
          ended_at?: string | null
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          started_at?: string | null
          user_id: string
        }
        Update: {
          device_info?: Json | null
          ended_at?: string | null
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          started_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_stakes_preferences: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_streaks: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          role: string | null
          status: string | null
          updated_at: string | null
          username: string
          verified: boolean | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          role?: string | null
          status?: string | null
          updated_at?: string | null
          username: string
          verified?: boolean | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: string | null
          status?: string | null
          updated_at?: string | null
          username?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      victory_cards: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount: number
          balance_after: number
          balance_before: number
          created_at: number
          currency: string
          description: string | null
          id: string
          metadata: Json | null
          source: string
          source_id: string | null
          type: string
          user_id: string
          wallet_id: string | null
        }
        Insert: {
          amount: number
          balance_after?: number
          balance_before?: number
          created_at: number
          currency: string
          description?: string | null
          id?: string
          metadata?: Json | null
          source: string
          source_id?: string | null
          type: string
          user_id: string
          wallet_id?: string | null
        }
        Update: {
          amount?: number
          balance_after?: number
          balance_before?: number
          created_at?: number
          currency?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          source?: string
          source_id?: string | null
          type?: string
          user_id?: string
          wallet_id?: string | null
        }
        Relationships: []
      }
      wallets: {
        Row: {
          balance: number | null
          created_at: string | null
          currency: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_leaderboard: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      xp_history: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_user_reroll: {
        Args: { p_date?: string; p_user_id: string }
        Returns: boolean
      }
      check_daily_generation_limit: {
        Args: { p_limit?: number; p_user_id: string }
        Returns: {
          can_generate: boolean
          remaining: number
        }[]
      }
      claim_journey_milestone: {
        Args: {
          p_milestone_number: number
          p_season_journey_id: string
          p_user_id: string
        }
        Returns: boolean
      }
      create_squad: {
        Args: {
          p_avatar_url?: string
          p_description?: string
          p_is_public?: boolean
          p_name: string
        }
        Returns: Json
      }
      delete_current_user: { Args: never; Returns: undefined }
      get_circle_activity_feed: {
        Args: { p_circle_id: string; p_limit?: number }
        Returns: {
          created_at: string
          data: Json
          id: string
          type: string
          user_avatar_url: string
          user_display_name: string
          user_id: string
        }[]
      }
      get_season_stats: {
        Args: { p_season_id: string }
        Returns: {
          average_tier: number
          premium_participants: number
          total_participants: number
          total_xp_earned: number
        }[]
      }
      get_story_engagement_stats: {
        Args: { p_days_back?: number; p_user_id: string }
        Returns: {
          avg_completion_rate: number
          most_engaging_beat_type: string
          total_stories: number
          viewed_stories: number
        }[]
      }
      get_today_dungeon: {
        Args: never
        Returns: {
          base_health: number
          bonus_rewards: Json | null
          boss_id: string
          boss_name: string
          created_at: string | null
          date: string
          guaranteed_reward: Json
          id: string
          special_mechanic: string
          theme: string
          time_limit_minutes: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "daily_dungeons"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_user_active_raid: {
        Args: { p_user_id: string }
        Returns: {
          boss_health: number
          boss_max_health: number
          boss_phase: number | null
          created_at: string | null
          damage_log: Json | null
          ended_at: string | null
          id: string
          scheduled_for: string
          squad_id: string
          started_at: string | null
          status: string | null
          template_id: string
          time_slot: string
          total_damage_dealt: number | null
          updated_at: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "squad_raids"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_user_journey_progress: {
        Args: { p_user_id: string }
        Returns: {
          current_milestone: number
          days_remaining: number
          milestone_progress: number
          next_milestone_xp: number
          season_id: string
          total_progress: number
          xp_to_next_milestone: number
        }[]
      }
      get_user_study_buddies: {
        Args: { p_user_id: string }
        Returns: {
          buddy_avatar_url: string
          buddy_display_name: string
          buddy_pair_id: string
          buddy_user_id: string
          can_send_encouragement: boolean
          created_at: string
          encouragements_received: number
          encouragements_sent: number
          longest_streak: number
          mutual_focus_time: number
          mutual_streak_days: number
          mutual_total_sessions: number
          shared_goal_description: string
          shared_goal_target: number
          shared_goal_timeframe: string
          status: string
        }[]
      }
      get_user_study_circles: {
        Args: { p_user_id: string }
        Returns: {
          can_post: boolean
          circle_id: string
          circle_name: string
          current_week_progress: number
          is_member: boolean
          member_count: number
          role: string
          weekly_goal_minutes: number
        }[]
      }
      increment_coins: {
        Args: { p_amount: number; p_user_id: string }
        Returns: number
      }
      join_study_circle: {
        Args: { p_circle_id: string; p_role?: string; p_user_id: string }
        Returns: boolean
      }
      leave_study_circle: {
        Args: { p_circle_id: string; p_user_id: string }
        Returns: boolean
      }
      purchase_battle_pass_premium: {
        Args: {
          p_gems_deducted: number
          p_season_id: string
          p_user_id: string
        }
        Returns: {
          claimed_free_tiers: number[]
          claimed_premium_tiers: number[]
          created_at: string
          current_tier: number
          id: string
          is_premium: boolean
          premium_purchased_at: string
          season_id: string
          tier_xp: number
          total_xp: number
          updated_at: string
          user_id: string
        }[]
      }
      record_squad_war_damage:
        | {
            Args: {
              p_damage: number
              p_session_id: string
              p_squad_id: string
              p_user_id: string
            }
            Returns: undefined
          }
        | {
            Args: {
              p_damage: number
              p_metadata: Json
              p_session_id: string
              p_squad_id: string
              p_user_id: string
            }
            Returns: undefined
          }
      send_study_buddy_encouragement: {
        Args: {
          p_buddy_pair_id: string
          p_from_user_id: string
          p_message: string
          p_to_user_id: string
          p_type: string
        }
        Returns: boolean
      }
      soft_delete_old_content: { Args: never; Returns: number }
      transfer_funds: {
        Args: {
          p_amount: number
          p_description?: string
          p_from_wallet_id: string
          p_to_wallet_id: string
        }
        Returns: Json
      }
      upsert_session_story: {
        Args: {
          p_created_at: number
          p_id: string
          p_session_id: string
          p_story_data: Json
          p_user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
