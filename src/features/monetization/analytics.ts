import { capture } from "../../shared/analytics";
import { PurchaseEvents } from "../../shared/monetization/purchase-events";

const SOURCE = "post_session_streak_shield";
const GATED_FEATURE = "streak_freeze";

export function trackStreakShieldMomentViewed(
  sessionId: string,
  streakDays: number,
): void {
  capture(PurchaseEvents.PAYWALL_VIEWED, {
    gated_feature: GATED_FEATURE,
    paywall_source: SOURCE,
    session_id: sessionId,
    streak_days: streakDays,
  });
}

export function trackStreakShieldMomentDismissed(sessionId: string): void {
  capture(PurchaseEvents.PAYWALL_DISMISSED, {
    gated_feature: GATED_FEATURE,
    paywall_source: SOURCE,
    session_id: sessionId,
  });
}
