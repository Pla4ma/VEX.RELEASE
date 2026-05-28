export {
  PrestigeBonusSchema,
  type PrestigeBonus,
  type PrestigeState,
  type PrestigeResult,
  type NightmareModeConfig,
} from "./prestige-types";
export {
  PRESTIGE_BONUSES,
  calculatePrestigeBonuses,
  applyPrestigeBonuses,
  getTotalBonusPercent,
} from "./prestige-bonuses";
export {
  canPrestige,
  executePrestige,
  getNightmareConfig,
  createInitialPrestigeState,
  migrateToPrestigeSystem,
} from "./prestige-engine";
