export interface ServiceConfig {
  levelUpRewardTypes: string[];
  xpRatePerMinute: number;
  maxLevel: number;
  prestigeEnabled: boolean;
  enableOfflineQueue: boolean;
}

const DEFAULT_CONFIG: ServiceConfig = {
  levelUpRewardTypes: ['XP_BOOST', 'COINS', 'GEMS'],
  xpRatePerMinute: 2,
  maxLevel: 100,
  prestigeEnabled: true,
  enableOfflineQueue: true,
};

let config: ServiceConfig = { ...DEFAULT_CONFIG };

export function configureProgressionService(
  newConfig: Partial<ServiceConfig>,
): void {
  config = { ...config, ...newConfig };
}

export function getProgressionServiceConfig(): ServiceConfig {
  return config;
}
