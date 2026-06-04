import { lightColors } from '@/theme/tokens/colors';


export const getRiskColor = (riskLevel: string): string => {
  switch (riskLevel) {
    case 'CRITICAL':
      return lightColors.semantic.danger;
    case 'HIGH':
      return lightColors.semantic.warning;
    case 'MEDIUM':
      return lightColors.semantic.warning;
    case 'LOW':
      return lightColors.semantic.warning;
    default:
      return lightColors.semantic.success;
  }
};

export const getFlameColor = (
  index: number,
  completed: boolean,
): [string, string] => {
  if (!completed) {
    return [lightColors.semantic.backgroundElevated, lightColors.semantic.backgroundElevated];
  }
  const day = index + 1;
  if (day >= 100) {
    return [lightColors.semantic.vexGold, lightColors.semantic.warning];
  }
  if (day >= 30) {
    return [lightColors.semantic.warning, lightColors.semantic.danger];
  }
  if (day >= 7) {
    return [lightColors.semantic.warning, lightColors.semantic.danger];
  }
  return [lightColors.semantic.warning, lightColors.semantic.warning];
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
