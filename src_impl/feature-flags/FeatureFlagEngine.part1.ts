import { createDebugger } from "@/utils/debug";
import { Platform } from "react-native";
import { MMKV } from "react-native-mmkv";


export const DEFAULT_FLAGS: FeatureFlagConfig[] = [
  {
    key: 'new_session_ui',
    defaultValue: false,
    rolloutPercentage: 0,
    platform: ['ios', 'android'],
  },
  {
    key: 'ai_coach_v2',
    defaultValue: false,
    rolloutPercentage: 0,
    requiresPremium: true,
  },
  {
    key: 'squad_wars_enabled',
    defaultValue: false,
    rolloutPercentage: 0,
  },
  {
    key: 'battle_pass_season_2',
    defaultValue: false,
    rolloutPercentage: 0,
  },
  {
    key: 'streak_recovery_v2',
    defaultValue: true,
    rolloutPercentage: 50, // Gradual rollout
  },
  {
    key: 'premium_gifting',
    defaultValue: false,
    rolloutPercentage: 0,
    requiresPremium: false, // Free users can receive
  },
  {
    key: 'analytics_enhanced',
    defaultValue: true,
    rolloutPercentage: 100,
  },
  // ===== 10X TRANSFORMATION FLAGS =====
  // Phase 1: Core Loop Revolution
  {
    key: 'real_time_boss_combat',
    defaultValue: false,
    rolloutPercentage: 0, // Start at 0, enable for testing
    description: 'Enable real-time boss combat overlay during sessions',
  },
  {
    key: 'consolidated_session_modes',
    defaultValue: false,
    rolloutPercentage: 0,
    description: 'Use 3 modes (FLOW/CHALLENGE/RECOVERY) instead of 5',
  },
  {
    key: 'real_time_purity_feedback',
    defaultValue: false,
    rolloutPercentage: 0,
    description: 'Show live purity score during sessions',
  },
  // Phase 2: Progression Redesign
  {
    key: 'focus_score_primary',
    defaultValue: true,
    rolloutPercentage: 100,
    description: 'Make Focus Score (300-850) the primary progression metric',
  },
  {
    key: 'mastery_skill_trees',
    defaultValue: false,
    rolloutPercentage: 0,
    description: 'Enable skill tree progression (Endurance/Intensity/Social/Tactics)',
  },
  {
    key: 'prestige_system',
    defaultValue: false,
    rolloutPercentage: 0,
    description: 'Enable ascension/prestige for max-level users',
  },
  // Phase 3: Social Systems
  {
    key: 'squad_energy_system',
    defaultValue: true,
    rolloutPercentage: 100,
    description: 'Replace synergy with energy pool mechanic',
  },
  {
    key: 'help_request_system',
    defaultValue: true,
    rolloutPercentage: 100,
    description: 'Enable "Send Help" during difficult sessions',
  },
  {
    key: 'squad_tournaments',
    defaultValue: false,
    rolloutPercentage: 0,
    description: 'Enable weekly squad vs squad tournaments',
  },
  // Phase 4: Economy
  {
    key: 'consolidated_currencies',
    defaultValue: true,
    rolloutPercentage: 100,
    description: 'Remove seasonal currency, use only COINS and GEMS',
  },
  {
    key: 'focus_points_currency',
    defaultValue: true,
    rolloutPercentage: 100,
    description: 'Enable FOCUS_POINTS as simplified primary earning currency',
  },
  {
    key: 'emergency_gem_sinks',
    defaultValue: false,
    rolloutPercentage: 0,
    description: 'DISABLED: Emergency gem sinks (streak freeze, boss retry, session save) - dark pattern risk',
  },
  {
    key: 'trading_system',
    defaultValue: false,
    rolloutPercentage: 0,
    description: 'Enable item trading between users',
  },
  // Phase 5: Retention
  {
    key: 'prime_time_events',
    defaultValue: true,
    rolloutPercentage: 100,
    description: 'Enable scheduled bonus windows (Morning Rally, Power Hour, etc)',
  },
  {
    key: 'streak_creature_system',
    defaultValue: true,
    rolloutPercentage: 100,
    description: 'Replace streak numbers with evolving creature companions',
  },
  {
    key: 'weekly_boss_raids',
    defaultValue: false,
    rolloutPercentage: 0,
    description: 'Enable weekend epic boss raids for squad collaboration',
  },
  {
    key: 'boss_bounty_system',
    defaultValue: false,
    rolloutPercentage: 0,
    description: 'DISABLED: Boss bounty loot multiplier system until economy risk is resolved',
  },
  {
    key: 'squad_boss_system',
    defaultValue: false,
    rolloutPercentage: 0,
    description: 'DISABLED: Squad boss subsystem until squads are simplified',
  },
  // Phase 6: AI Coach
  {
    key: 'predictive_interventions',
    defaultValue: true,
    rolloutPercentage: 100,
    description: 'AI predicts and prevents problems vs reactive',
  },
  {
    key: 'adaptive_difficulty',
    defaultValue: true,
    rolloutPercentage: 100,
    description: 'Dynamic boss difficulty based on user performance',
  },
  // System Sunsets (gradual deprecation)
  {
    key: 'legacy_linear_leveling',
    defaultValue: true, // Start enabled, sunset gradually
    rolloutPercentage: 0, // Phase 8A: Complete sunset
    description: 'DEPRECATED: Old linear level system (being replaced by Focus Score)',
  },
  {
    key: 'legacy_squad_synergy',
    defaultValue: true, // Start enabled, sunset gradually
    rolloutPercentage: 0, // Phase 8A: Complete sunset
    description: 'DEPRECATED: Old synergy system (being replaced by Energy)',
  },
  {
    key: 'legacy_seasonal_currency',
    defaultValue: true,
    rolloutPercentage: 0, // Phase 8A: Complete sunset
    description: 'DEPRECATED: Seasonal currency (being removed)',
  },
];