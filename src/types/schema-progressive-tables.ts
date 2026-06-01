import type { TableClassification } from './schema-classification-types';

export const PROGRESSIVE_TABLES: TableClassification[] = [
  {
    table: 'companion_memories',
    class: 'progressive',
    feature: 'companion_detail',
  },
  { table: 'challenges', class: 'progressive', feature: 'challenges' },
  { table: 'challenge_templates', class: 'progressive', feature: 'challenges' },
  { table: 'challenge_rerolls', class: 'progressive', feature: 'challenges' },
  { table: 'user_challenges', class: 'progressive', feature: 'challenges' },
  { table: 'wallets', class: 'progressive', feature: 'economy_basic' },
  { table: 'unified_wallets', class: 'progressive', feature: 'economy_basic' },
  { table: 'transactions', class: 'progressive', feature: 'economy_basic' },
  {
    table: 'wallet_transactions',
    class: 'progressive',
    feature: 'economy_basic',
  },
  { table: 'rewards', class: 'progressive', feature: 'economy_basic' },
  { table: 'reward_ledger', class: 'progressive', feature: 'economy_basic' },
  {
    table: 'reward_deliveries',
    class: 'progressive',
    feature: 'economy_basic',
  },
  { table: 'chests', class: 'progressive', feature: 'economy_basic' },
  {
    table: 'daily_reward_claims',
    class: 'progressive',
    feature: 'economy_basic',
  },
  {
    table: 'user_daily_rewards',
    class: 'progressive',
    feature: 'economy_basic',
  },
  { table: 'user_achievements', class: 'progressive', feature: 'achievements' },
  { table: 'boss_encounters', class: 'progressive', feature: 'boss_tab' },
  { table: 'boss_templates', class: 'progressive', feature: 'boss_tab' },
  { table: 'boss_cooldowns', class: 'progressive', feature: 'boss_tab' },
  { table: 'boss_defeat_history', class: 'progressive', feature: 'boss_tab' },
  {
    table: 'coach_memories',
    class: 'progressive',
    feature: 'ai_coach_advanced',
  },
  {
    table: 'coach_personas',
    class: 'progressive',
    feature: 'ai_coach_advanced',
  },
  { table: 'coach_quests', class: 'progressive', feature: 'ai_coach_advanced' },
  {
    table: 'coach_message_templates',
    class: 'progressive',
    feature: 'ai_coach_advanced',
  },
  {
    table: 'user_coach_preferences',
    class: 'progressive',
    feature: 'ai_coach_advanced',
  },
  {
    table: 'mastery_tracks',
    class: 'progressive',
    feature: 'ai_coach_advanced',
  },
  { table: 'study_content', class: 'progressive', feature: 'content_study' },
  {
    table: 'study_generations',
    class: 'progressive',
    feature: 'content_study',
  },
  { table: 'study_packs', class: 'progressive', feature: 'content_study' },
  {
    table: 'journey_seasons',
    class: 'progressive',
    feature: 'seasonal_features',
  },
  {
    table: 'journey_progress',
    class: 'progressive',
    feature: 'seasonal_features',
  },
  {
    table: 'journey_milestones',
    class: 'progressive',
    feature: 'seasonal_features',
  },
  { table: 'seasons', class: 'progressive', feature: 'seasonal_features' },
  {
    table: 'season_history',
    class: 'progressive',
    feature: 'seasonal_features',
  },
  {
    table: 'season_journeys',
    class: 'progressive',
    feature: 'seasonal_features',
  },
  {
    table: 'user_journeys',
    class: 'progressive',
    feature: 'seasonal_features',
  },
  {
    table: 'user_journey_claims',
    class: 'progressive',
    feature: 'seasonal_features',
  },
  {
    table: 'user_season_progress',
    class: 'progressive',
    feature: 'seasonal_features',
  },
];
