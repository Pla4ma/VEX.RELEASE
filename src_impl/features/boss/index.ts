/**
 * Boss Feature Barrel Export
 */

// Types
export * from './types';
export {
  BossRewardTypeSchema,
  BossTemplateSchema,
  BossEncounterStatusSchema,
  BossEncounterSchema,
  BossEncounterSummarySchema,
  BossDamageItemSchema,
  DamageCalculationInputSchema,
  BossDamageResultSchema,
  BossRewardSchema,
  BossDefeatResultSchema,
  BossDefeatSummarySchema,
  CreateEncounterInputSchema,
  ApplyDamageInputSchema,
  CalculateDamageInputSchema,
} from './schemas';
export type {
  CreateEncounterInput,
  ApplyDamageInput,
  CalculateDamageInput,
} from './schemas';

// Service
export * from './service';
export * as bossRepository from './repository';

// Hooks
export * from './hooks';

// Analytics
export * from './analytics';

// Phase 10.5 - Boss Spectator Mode
export {
  BossSpectatorMode,
  type SpectatorBossData,
  type Contributor,
  type CheerMessage,
} from './components/BossSpectatorMode';

// Phase 11.1 - Boss Prime Time
export {
  PrimeTimeBanner,
  PrePrimeTimeBanner,
} from './components/PrimeTimeBanner';
export {
  calculatePrimeTimeWindow,
  isPrimeTimeActive,
  getPrimeTimeStatusText,
  calculatePrimeTimeXP,
  usePrimeTime,
  type PrimeTimeWindow,
} from './BossSpawnScheduler';

// PHASE 5.4: Economy Stakes - Boss Bounty System
export {
  getBountyStatus,
  placeBounty,
  consumeBountiesOnDamage,
  getActiveBounties,
  userHasActiveBounty,
  cleanupExpiredBounties,
  getBountyDisplayInfo,
  BOUNTY_COST_COINS,
  BOUNTY_LOOT_MULTIPLIER,
  MAX_BOUNTY_STACK,
  type BossBounty,
  type BountyStatus,
  type PlaceBountyInput,
  type PlaceBountyResult,
} from './BossBountySystem';
export {
  consumeBountyLootBoost,
  recordBountyLootBoost,
  type BountyLootBoost,
} from './bounty-loot-boost';

// PHASE 12.1 - Boss Roster Expansion with Taunts
export {
  EXPANSION_BOSSES,
  getExpansionBosses,
  getBossById,
  getAvailableBosses,
  getBossSpawnSchedule,
  getBossFlavorText,
  getBossArtworkDescription,
  type ExpansionBossTemplate,
} from './boss-roster-expansion';

// PHASE 12.3 - Boss-Specific Loot
export {
  BOSS_LOOT_TABLE,
  getBossLoot,
  getLootForDefeatedBosses,
  hasBossLoot,
  type BossLootItem,
} from './boss-loot';

// PHASE 12.4 - Boss Tier Progression Gate
export {
  BossTierGate,
  LockedBossCard,
  isBossTierUnlocked,
  getRequiredRankForTier,
  getTierAvailabilityText,
  type BossTierGateProps,
  type LockedBossCardProps,
} from './components/BossTierGate';

// Phase 3.1 - Boss Battle System Overhaul
// Narrative Arcs with Phases
export {
  BOSS_NARRATIVE_ARCS,
  getBossNarrativeArc,
  determineBossPhase,
  calculateHealthPercent,
  getPhaseNarrative,
  getRandomTaunt,
  getCurrentVisualTheme,
  getCurrentMusicMood,
  getPhaseEffects,
  initializePhaseState,
  updatePhaseState,
  getPhaseState,
  recordTauntShown,
  clearPhaseState,
  getBossStory,
  getBossTheme,
  hasNarrativeArc,
  getAllNarrativeArcs,
  type BossPhase,
  type BossNarrativeArc,
  type PhaseNarrative,
  type VisualTheme,
  type MusicMood,
  type PhaseEffects,
  type BossPhaseState,
  type BossTheme,
} from './BossNarrativeSystem';

// Prime Time Windows
export {
  generatePrimeTimeWindows,
  checkPrimeTimeStatus,
  getPrimeTimeMultiplier,
  shouldSendPrimeTimeNotification,
  markNotificationSent,
  getPrimeTimeNotificationMessage,
  storePrimeTimeSchedule,
  getPrimeTimeSchedule,
  clearPrimeTimeSchedule,
  getAllActivePrimeTimeWindows,
  recordPrimeTimeDamage,
  getPrimeTimeAnalytics,
  getPrimeTimeBadgeText,
  getRecommendedAttackMessage,
  PRIME_TIME_DURATION_MS,
  PRIME_TIME_DAMAGE_MULTIPLIER,
  PRIME_TIME_BONUS_LOOT_CHANCE,
  type PrimeTimeStatus,
  type PrimeTimeSchedule,
  type PrimeTimeAnalytics,
  type PrimeTimePattern,
} from './BossPrimeTimeSystem';

// Squad Boss Cooperative Battles
export {
  calculateSquadBossHealth,
  createSquadBossEncounter,
  applySquadMemberDamage,
  calculateMVP,
  getMemberRanking,
  createVictoryCeremony,
  getSquadProgressSummary,
  canMemberJoin,
  addMemberToEncounter,
  recordBountyPlaced,
  getActiveBountyCount,
  MVP_BONUS_MULTIPLIER,
  PARTICIPATION_THRESHOLD,
  type SquadBossEncounter,
  type SquadMemberContribution,
  type SquadVictoryCeremony,
  type SquadSharedReward,
  type SquadBossInvite,
} from './SquadBossSystem';
