import { eventBus } from "../../events";


export function getPrimeTimeBadgeText(status: PrimeTimeStatus): string | null {
  if (status.isPrimeTime) {
    return `⚡ ${Math.round((status.damageMultiplier - 1) * 100)}% Bonus Damage`;
  }
  if (status.hoursUntilNext && status.hoursUntilNext <= 2) {
    return `⏰ Prime Time in ${Math.round(status.hoursUntilNext * 10) / 10}h`;
  }
  return null;
}

export function getRecommendedAttackMessage(status: PrimeTimeStatus): string {
  if (status.isPrimeTime) {
    return `🔥 PRIME TIME ACTIVE! Deal bonus damage for ${formatTimeRemaining(status.timeRemaining)}`;
  }
  if (status.nextWindow && status.hoursUntilNext && status.hoursUntilNext <= 4) {
    return `⏰ Prime Time starts in ${Math.round(status.hoursUntilNext * 10) / 10}h`;
  }
  return 'Attack anytime - focus is always powerful!';
}