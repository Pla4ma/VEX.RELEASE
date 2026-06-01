import { useStreakRisk } from './useStreakRisk';

export function useFlameHealth(): {
  healthPercent: number;
  color: string;
  isAtRisk: boolean;
} {
  const { flameHealthPercent, flameColor, isAtRisk } = useStreakRisk();
  return { healthPercent: flameHealthPercent, color: flameColor, isAtRisk };
}
