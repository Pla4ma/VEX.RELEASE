import type { TableClassification } from './schema-classification-types';

export const PROGRESSIVE_EXTENSION_TABLES: TableClassification[] = [
  { table: 'level_up_history', class: 'progressive', feature: 'economy_basic' },
  { table: 'prestige_states', class: 'progressive', feature: 'economy_basic' },
  { table: 'insights', class: 'progressive', feature: 'ai_coach_advanced' },
  {
    table: 'intervention_rules',
    class: 'progressive',
    feature: 'ai_coach_advanced',
  },
  {
    table: 'intervention_executions',
    class: 'progressive',
    feature: 'ai_coach_advanced',
  },
  {
    table: 'behavior_profiles',
    class: 'progressive',
    feature: 'ai_coach_advanced',
  },
  {
    table: 'behavior_signals',
    class: 'progressive',
    feature: 'ai_coach_advanced',
  },
  {
    table: 'detected_patterns',
    class: 'progressive',
    feature: 'ai_coach_advanced',
  },
  {
    table: 'currency_conversions',
    class: 'progressive',
    feature: 'economy_advanced',
  },
  { table: 'item_definitions', class: 'progressive', feature: 'inventory' },
  { table: 'inventory_items', class: 'progressive', feature: 'inventory' },
  { table: 'user_items', class: 'progressive', feature: 'inventory' },
  {
    table: 'streak_shields',
    class: 'progressive',
    feature: 'streak_insurance',
  },
  {
    table: 'streak_insurance',
    class: 'progressive',
    feature: 'streak_insurance',
  },
  {
    table: 'streak_repair_quests',
    class: 'progressive',
    feature: 'streak_insurance',
  },
  {
    table: 'streak_risk_status',
    class: 'progressive',
    feature: 'streak_insurance',
  },
  { table: 'streak_gambles', class: 'progressive', feature: 'wagers' },
  { table: 'stakes_sessions', class: 'progressive', feature: 'wagers' },
  { table: 'user_stakes_preferences', class: 'progressive', feature: 'wagers' },
  { table: 'comeback_plans', class: 'progressive', feature: 'comeback_quests' },
  {
    table: 'comeback_quests',
    class: 'progressive',
    feature: 'comeback_quests',
  },
  {
    table: 'comeback_tokens',
    class: 'progressive',
    feature: 'comeback_quests',
  },
  { table: 'daily_dungeons', class: 'progressive', feature: 'challenges' },
  {
    table: 'user_dungeon_attempts',
    class: 'progressive',
    feature: 'challenges',
  },
  {
    table: 'mystery_multipliers',
    class: 'progressive',
    feature: 'economy_basic',
  },
  { table: 'drop_tables', class: 'progressive', feature: 'economy_basic' },
  { table: 'limited_offers', class: 'progressive', feature: 'shop' },
  { table: 'user_offer_claims', class: 'progressive', feature: 'shop' },
  { table: 'quick_use_slots', class: 'progressive', feature: 'inventory' },
];
