import { z } from "zod";
import * as Sentry from "@sentry/react-native";
import { MMKV } from "react-native-mmkv";


export const dailyLuckyBonusService = new DailyLuckyBonusService();

export function isLuckyBonusAvailable(userId: string): boolean {
  return dailyLuckyBonusService.getStatus(userId).available;
}

export function getLuckyBonusDisplay(userId: string): {
  available: boolean;
  badge: string;
  subtitle: string;
} {
  const status = dailyLuckyBonusService.getStatus(userId);

  if (status.available) {
    return {
      available: true,
      badge: '🍀',
      subtitle: 'Lucky Bonus Available',
    };
  }

  const countdown = dailyLuckyBonusService.getCountdownString(status);
  return {
    available: false,
    badge: '⏰',
    subtitle: `Next bonus in ${countdown}`,
  };
}

export function useLuckyBonus(userId: string): LuckyBonusStatus & {
  countdownString: string;
} {
  const status = dailyLuckyBonusService.getStatus(userId);
  return {
    ...status,
    countdownString: dailyLuckyBonusService.getCountdownString(status),
  };
}