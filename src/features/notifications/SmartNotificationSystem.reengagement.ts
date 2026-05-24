import type { NotificationType } from "./SmartNotificationSystem.types";
import { notificationHistory } from "./SmartNotificationSystem";

export interface ReEngagementStage {
  dayThreshold: number;
  notificationType: NotificationType;
  title: string;
  body: string;
  offerIncentive?: boolean;
}

export const RE_ENGAGEMENT_STAGES: ReEngagementStage[] = [
  {
    dayThreshold: 3,
    notificationType: "COMEBACK",
    title: "We miss you! \uD83D\uDC99",
    body: "Life happens. When you're ready, your streak can start again.",
  },
  {
    dayThreshold: 7,
    notificationType: "RE_ENGAGEMENT",
    title: "Your progress is waiting \uD83C\uDF31",
    body: "You were building something great. Ready to continue?",
  },
  {
    dayThreshold: 14,
    notificationType: "RE_ENGAGEMENT",
    title: "Fresh start, same you \u2728",
    body: "New boss available. Perfect time to jump back in!",
  },
  {
    dayThreshold: 30,
    notificationType: "RE_ENGAGEMENT",
    title: "Special comeback offer \uD83C\uDF81",
    body: "We saved your progress. Start a free trial to unlock everything.",
    offerIncentive: true,
  },
];

export function getReEngagementMessage(
  daysInactive: number,
): ReEngagementStage | null {
  const stage = [...RE_ENGAGEMENT_STAGES]
    .reverse()
    .find((s) => daysInactive >= s.dayThreshold);
  return stage ?? null;
}

export function shouldReEngage(
  userId: string,
  daysInactive: number,
  hasBeenNotified: boolean = false,
): boolean {
  if (daysInactive < 3) {
    return false;
  }
  if (hasBeenNotified) {
    return false;
  }
  const stage = getReEngagementMessage(daysInactive);
  if (!stage) {
    return false;
  }
  const history = notificationHistory.get(userId) ?? [];
  const lastReEngagement = history
    .filter((n) => n.type === "RE_ENGAGEMENT" || n.type === "COMEBACK")
    .pop();
  if (lastReEngagement?.sentAt) {
    const daysSinceLast =
      (Date.now() - lastReEngagement.sentAt) / (1000 * 60 * 60 * 24);
    return daysSinceLast >= 7;
  }
  return true;
}
