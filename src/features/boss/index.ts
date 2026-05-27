// Boss feature — active runtime is PersonalBoss / blocker concept only.
// Legacy RPG combat system (damage engine, squads, bounties, coins/gems, community boss)
// archived to archive/features/boss/.
//
// Active exports:
// - PersonalBossBlock type (schemas.ts/types.ts)
// - display policy (is it visible given motivation style?)
// - FeatureAvailability gate (final-release-feature-map: boss_tab)
//
// Focus Run owns the modern game-like lane via focus-run/boss-resolution.ts

export type { PersonalBossBlock, BossVisibility, PersonalBossCompletionSignal } from './types';
export { PersonalBossBlockSchema } from './types';
export { shouldShowBossPreview, isBossVisibleAtSurface, isCombatAllowed, getBossDisplayCopy } from './display-policy';
export { bossRepository } from './repository';
export { useActiveBoss, useBossEngagementSummary, useAvailableBosses } from './hooks';
export { getBossEngagementSignals, deriveBossEngagementLevel } from './boss-engagement-signals';
export type { BossEngagementSignal, BossEngagementLevel, BossEngagementInputs } from './boss-engagement-signals';
export { trackBossEvent, trackBossRouteOpened, trackBossCTAClicked } from './analytics';
