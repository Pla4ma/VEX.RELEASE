

export const getRiskColor = (riskLevel: string): string => {
  switch (riskLevel) {
    case 'CRITICAL':
      return '#f44336';
    case 'HIGH':
      return '#ff9800';
    case 'MEDIUM':
      return '#ffc107';
    case 'LOW':
      return '#ffeb3b';
    default:
      return '#4caf50';
  }
};

export const getFlameColor = (
  index: number,
  completed: boolean,
): [string, string] => {
  if (!completed) {
    return ['#3a3a5a', '#2a2a4a'];
  }
  const day = index + 1;
  if (day >= 100) {
    return ['#ffd700', '#ff6b35'];
  }
  if (day >= 30) {
    return ['#ff6b35', '#f44336'];
  }
  if (day >= 7) {
    return ['#ff9800', '#ff5722'];
  }
  return ['#ffc107', '#ff9800'];
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
