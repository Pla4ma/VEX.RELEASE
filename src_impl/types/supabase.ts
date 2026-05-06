/**
 * Supabase Database Types
 * Auto-generated types for VEX app
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          display_name: string
          avatar_url: string | null
          timezone: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          display_name: string
          avatar_url?: string | null
          timezone?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string
          avatar_url?: string | null
          timezone?: string
          created_at?: string
          updated_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          user_id: string
          duration: number
          effective_duration: number
          status: string
          quality_score: number
          pause_count: number
          total_pause_seconds: number
          created_at: string
          completed_at: string | null
          config: Json
        }
        Insert: {
          id?: string
          user_id: string
          duration: number
          effective_duration?: number
          status?: string
          quality_score?: number
          pause_count?: number
          total_pause_seconds?: number
          created_at?: string
          completed_at?: string | null
          config?: Json
        }
        Update: {
          id?: string
          user_id?: string
          duration?: number
          effective_duration?: number
          status?: string
          quality_score?: number
          pause_count?: number
          total_pause_seconds?: number
          created_at?: string
          completed_at?: string | null
          config?: Json
        }
      }
      streaks: {
        Row: {
          id: string
          user_id: string
          current_days: number
          longest_days: number
          shields_available: number
          grace_period_used: boolean
          last_qualifying_session_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          current_days?: number
          longest_days?: number
          shields_available?: number
          grace_period_used?: boolean
          last_qualifying_session_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          current_days?: number
          longest_days?: number
          shields_available?: number
          grace_period_used?: boolean
          last_qualifying_session_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      bosses: {
        Row: {
          id: string
          user_id: string | null
          squad_id: string | null
          boss_id: string
          health_remaining: number
          max_health: number
          damage_dealt: number
          status: string
          started_at: string
          expires_at: string
          defeated_at: string | null
          contributing_session_ids: string[]
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          squad_id?: string | null
          boss_id: string
          health_remaining: number
          max_health: number
          damage_dealt?: number
          status?: string
          started_at?: string
          expires_at: string
          defeated_at?: string | null
          contributing_session_ids?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          squad_id?: string | null
          boss_id?: string
          health_remaining?: number
          max_health?: number
          damage_dealt?: number
          status?: string
          started_at?: string
          expires_at?: string
          defeated_at?: string | null
          contributing_session_ids?: string[]
          created_at?: string
        }
      }
      achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          unlocked_at: string
          progress: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          unlocked_at?: string
          progress?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          unlocked_at?: string
          progress?: number
          created_at?: string
        }
      }
      squads: {
        Row: {
          id: string
          name: string
          description: string | null
          created_by: string
          focus_multiplier: number
          level: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_by: string
          focus_multiplier?: number
          level?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_by?: string
          focus_multiplier?: number
          level?: number
          created_at?: string
          updated_at?: string
        }
      }
      squad_members: {
        Row: {
          id: string
          squad_id: string
          user_id: string
          role: string
          joined_at: string
        }
        Insert: {
          id?: string
          squad_id: string
          user_id: string
          role?: string
          joined_at?: string
        }
        Update: {
          id?: string
          squad_id?: string
          user_id?: string
          role?: string
          joined_at?: string
        }
      }
      wallet: {
        Row: {
          id: string
          user_id: string
          coins: number
          gems: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          coins?: number
          gems?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          coins?: number
          gems?: number
          created_at?: string
          updated_at?: string
        }
      }
      progression: {
        Row: {
          id: string
          user_id: string
          level: number
          xp: number
          total_xp: number
          next_level_threshold: number
          tier: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          level?: number
          xp?: number
          total_xp?: number
          next_level_threshold?: number
          tier?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          level?: number
          xp?: number
          total_xp?: number
          next_level_threshold?: number
          tier?: string
          created_at?: string
          updated_at?: string
        }
      }
      feed_items: {
        Row: {
          id: string
          user_id: string
          type: string
          content: string
          metadata: Json
          visibility: string[]
          mentioned_user_ids: string[]
          mentioned_squad_ids: string[]
          mentioned_guild_ids: string[]
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          content: string
          metadata?: Json
          visibility?: string[]
          mentioned_user_ids?: string[]
          mentioned_squad_ids?: string[]
          mentioned_guild_ids?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          content?: string
          metadata?: Json
          visibility?: string[]
          mentioned_user_ids?: string[]
          mentioned_squad_ids?: string[]
          mentioned_guild_ids?: string[]
          created_at?: string
        }
      }
      challenges: {
        Row: {
          id: string
          user_id: string
          challenge_id: string
          status: string
          progress: number
          target_value: number
          started_at: string
          completed_at: string | null
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          challenge_id: string
          status?: string
          progress?: number
          target_value: number
          started_at?: string
          completed_at?: string | null
          expires_at: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          challenge_id?: string
          status?: string
          progress?: number
          target_value?: number
          started_at?: string
          completed_at?: string | null
          expires_at?: string
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          body: string
          data: Json
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          body: string
          data?: Json
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          body?: string
          data?: Json
          read?: boolean
          created_at?: string
        }
      }
      inventory_items: {
        Row: {
          id: string
          user_id: string
          item_id: string
          quantity: number
          equipped: boolean
          acquired_at: string
        }
        Insert: {
          id?: string
          user_id: string
          item_id: string
          quantity?: number
          equipped?: boolean
          acquired_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          item_id?: string
          quantity?: number
          equipped?: boolean
          acquired_at?: string
        }
      }
      shop_items: {
        Row: {
          id: string
          item_id: string
          name: string
          description: string
          price_coins: number | null
          price_gems: number | null
          category: string
          min_level: number
          created_at: string
        }
        Insert: {
          id?: string
          item_id: string
          name: string
          description: string
          price_coins?: number | null
          price_gems?: number | null
          category: string
          min_level?: number
          created_at?: string
        }
        Update: {
          id?: string
          item_id?: string
          name?: string
          description?: string
          price_coins?: number | null
          price_gems?: number | null
          category?: string
          min_level?: number
          created_at?: string
        }
      }
      battle_pass: {
        Row: {
          id: string
          user_id: string
          season_id: string
          tier: number
          tier_xp: number
          is_premium: boolean
          claimed_rewards: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          season_id: string
          tier?: number
          tier_xp?: number
          is_premium?: boolean
          claimed_rewards?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          season_id?: string
          tier?: number
          tier_xp?: number
          is_premium?: boolean
          claimed_rewards?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      seasons: {
        Row: {
          id: string
          name: string
          description: string | null
          start_date: string
          end_date: string
          theme: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          start_date: string
          end_date: string
          theme?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          start_date?: string
          end_date?: string
          theme?: string
          created_at?: string
        }
      }
      duels: {
        Row: {
          id: string
          challenger_id: string
          opponent_id: string
          status: string
          metric: string
          stake: number
          challenger_score: number
          opponent_score: number
          started_at: string
          ends_at: string
          winner_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          challenger_id: string
          opponent_id: string
          status?: string
          metric: string
          stake?: number
          challenger_score?: number
          opponent_score?: number
          started_at?: string
          ends_at: string
          winner_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          challenger_id?: string
          opponent_id?: string
          status?: string
          metric?: string
          stake?: number
          challenger_score?: number
          opponent_score?: number
          started_at?: string
          ends_at?: string
          winner_id?: string | null
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          feed_item_id: string
          user_id: string
          content: string
          parent_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          feed_item_id: string
          user_id: string
          content: string
          parent_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          feed_item_id?: string
          user_id?: string
          content?: string
          parent_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      reactions: {
        Row: {
          id: string
          feed_item_id: string
          user_id: string
          type: string
          created_at: string
        }
        Insert: {
          id?: string
          feed_item_id: string
          user_id: string
          type: string
          created_at?: string
        }
        Update: {
          id?: string
          feed_item_id?: string
          user_id?: string
          type?: string
          created_at?: string
        }
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// Convenience types for common tables
export type User = Tables<'users'>
export type Session = Tables<'sessions'>
export type Streak = Tables<'streaks'>
export type Boss = Tables<'bosses'>
export type Achievement = Tables<'achievements'>
export type Squad = Tables<'squads'>
export type SquadMember = Tables<'squad_members'>
export type Wallet = Tables<'wallet'>
export type Progression = Tables<'progression'>
export type FeedItem = Tables<'feed_items'>
export type Challenge = Tables<'challenges'>
export type Notification = Tables<'notifications'>
export type InventoryItem = Tables<'inventory_items'>
export type ShopItem = Tables<'shop_items'>
export type BattlePass = Tables<'battle_pass'>
export type Season = Tables<'seasons'>
export type Duel = Tables<'duels'>
export type Comment = Tables<'comments'>
export type Reaction = Tables<'reactions'>
