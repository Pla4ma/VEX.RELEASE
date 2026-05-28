import { capture } from "../../shared/analytics/analytics-service";

export function trackFocusIdentityCreated(
  userId: string,
  initialScore: number,
  band: string,
): void {
  capture("focus_identity_created", {
    user_id: userId,
    initial_score: initialScore,
    initial_band: band,
    source: "onboarding",
  });
}

export function trackFocusScoreUpdated(
  userId: string,
  previousScore: number,
  newScore: number,
  change: number,
  band: string,
  reason: string,
  isInRecovery: boolean,
): void {
  capture("focus_score_updated", {
    user_id: userId,
    previous_score: previousScore,
    new_score: newScore,
    delta: change,
    band,
    reason,
    is_in_recovery: isInRecovery,
  });
  if (Math.abs(change) >= 20) {
    capture("focus_score_significant_change", {
      user_id: userId,
      change_magnitude: change > 0 ? "positive_large" : "negative_large",
      change_amount: Math.abs(change),
      band,
    });
  }
}

export function trackFocusScoreChanged(input: {
  userId: string;
  previousScore: number;
  currentScore: number;
  reason: string;
}): void {
  trackFocusScoreUpdated(
    input.userId,
    input.previousScore,
    input.currentScore,
    input.currentScore - input.previousScore,
    "Good",
    input.reason,
    false,
  );
}

export function trackScoreBandChange(
  userId: string,
  oldBand: string,
  newBand: string,
  newScore: number,
): void {
  capture("focus_score_band_change", {
    user_id: userId,
    previous_band: oldBand,
    new_band: newBand,
    new_score: newScore,
    direction: newScore > 500 ? "upward" : "downward",
  });
}

export function trackRecoveryStarted(
  userId: string,
  preLapseScore: number,
  trigger: string,
): void {
  capture("focus_recovery_started", {
    user_id: userId,
    pre_lapse_score: preLapseScore,
    recovery_trigger: trigger,
  });
}

export function trackRecoveryCompleted(
  userId: string,
  finalScore: number,
  daysInRecovery: number,
): void {
  capture("focus_recovery_completed", {
    user_id: userId,
    final_score: finalScore,
    days_in_recovery: daysInRecovery,
  });
}
