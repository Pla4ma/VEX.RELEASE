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
      squad_members: {
        Row: {
          id: string
          joined_at: string | null
          role: string | null
          squad_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          role?: string | null
          squad_id: string
          user_id: string
        }
        Update: {
          id?: string
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
      get_season_stats: {
        Args: { p_season_id: string }
        Returns: {
          average_tier: number
          premium_participants: number
          total_participants: number
          total_xp_earned: number
        }[]
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
