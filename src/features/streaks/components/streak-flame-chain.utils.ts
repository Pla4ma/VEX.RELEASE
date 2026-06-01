import { launchColors } from '@theme/tokens/launch-colors';

export const getRiskColor = (riskLevel: string): string => {
  switch (riskLevel) {
    case 'CRITICAL':
      return launchColors.hex_f44336;
    case 'HIGH':
      return launchColors.hex_ff9800;
    case 'MEDIUM':
      return launchColors.hex_ffc107;
    case 'LOW':
      return launchColors.hex_ffeb3b;
    default:
      return launchColors.hex_4caf50;
  }
};

export const getFlameColor = (
  index: number,
  completed: boolean,
): [string, string] => {
  if (!completed) {
    return [launchColors.hex_3a3a5a, launchColors.hex_2a2a4a];
  }
  const day = index + 1;
  if (day >= 100) {
    return [launchColors.hex_ffd700, launchColors.hex_ff6b35];
  }
  if (day >= 30) {
    return [launchColors.hex_ff6b35, launchColors.hex_f44336];
  }
  if (day >= 7) {
    return [launchColors.hex_ff9800, launchColors.hex_ff5722];
  }
  return [launchColors.hex_ffc107, launchColors.hex_ff9800];
};

export const getMilestoneReward = (days: number): string => {
  const rewards: Record<number, string> = {
    3: '100 Coins',
    7: '250 Coins',
    14: '25 Gems',
    30: 'Streak Shield',
    60: '100 Gems',
    100: '250 Gems',
    180: '500 Gems',
    365: '1000 Gems + Legendary Badge',
  };
  return rewards[days] || 'Special Reward';
};
