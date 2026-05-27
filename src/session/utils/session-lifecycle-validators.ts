import type {
  ValidationResult,
  SessionValidationInput,
} from "./validation";
import { validateSessionConfig } from "./validation";

export function validateSessionStart(
  config: unknown,
  userState: {
    isAuthenticated: boolean;
    hasActiveSession: boolean;
    networkStatus: "online" | "offline";
    dailySessionCount: number;
    maxDailySessions?: number;
  },
): ValidationResult<SessionValidationInput> {
  const result = validateSessionConfig(config);
  if (!result.success) {
    return result;
  }
  if (!userState.isAuthenticated) {
    result.success = false;
    result.errors.push({
      field: "user",
      message: "User must be authenticated to start a session",
      code: "NOT_AUTHENTICATED",
    });
  }
  if (userState.hasActiveSession) {
    result.success = false;
    result.errors.push({
      field: "session",
      message: "User already has an active session",
      code: "ACTIVE_SESSION_EXISTS",
    });
  }
  if (userState.networkStatus === "offline") {
    result.warnings.push({
      field: "network",
      message: "Offline mode: Session will sync when connection restored",
      code: "OFFLINE_MODE",
    });
  }
  const maxSessions = userState.maxDailySessions || 50;
  if (userState.dailySessionCount >= maxSessions) {
    result.warnings.push({
      field: "dailyLimit",
      message: `You've reached ${userState.dailySessionCount} sessions today. Consider quality over quantity.`,
      code: "DAILY_SESSION_LIMIT",
    });
  }
  return result;
}

export function validateSessionPause(sessionState: {
  status: string;
  elapsedTime: number;
  pauseCount: number;
  strictMode: boolean;
}): ValidationResult<void> {
  const result: ValidationResult<void> = {
    success: true,
    errors: [],
    warnings: [],
  };
  if (sessionState.status !== "ACTIVE") {
    result.success = false;
    result.errors.push({
      field: "status",
      message: `Cannot pause session in ${sessionState.status} state`,
      code: "INVALID_STATUS_FOR_PAUSE",
    });
  }
  if (sessionState.strictMode) {
    result.warnings.push({
      field: "strictMode",
      message: "Strict mode is enabled. Pausing will affect your purity score.",
      code: "STRICT_MODE_PAUSE",
    });
  }
  if (sessionState.pauseCount >= 5) {
    result.warnings.push({
      field: "pauseCount",
      message: `You've paused ${sessionState.pauseCount} times. Frequent pauses reduce session quality.`,
      code: "EXCESSIVE_PAUSES",
    });
  }
  if (sessionState.elapsedTime < 60) {
    result.warnings.push({
      field: "elapsedTime",
      message: "Pausing very early in session may indicate focus issues",
      code: "EARLY_PAUSE",
    });
  }
  return result;
}

export function validateSessionCompletion(sessionState: {
  elapsedTime: number;
  duration: number;
  completionPercentage: number;
  interruptions: number;
  anticheatFlags: number;
}): ValidationResult<{
  canComplete: boolean;
  recommendedAction: "complete" | "abandon" | "review";
}> {
  const result: ValidationResult<{
    canComplete: boolean;
    recommendedAction: "complete" | "abandon" | "review";
  }> = {
    success: true,
    errors: [],
    warnings: [],
    data: { canComplete: true, recommendedAction: "complete" },
  };
  const {
    elapsedTime,
    duration,
    completionPercentage,
    interruptions,
    anticheatFlags,
  } = sessionState;
  if (completionPercentage < 5) {
    result.data = { canComplete: false, recommendedAction: "abandon" };
    result.warnings.push({
      field: "completionPercentage",
      message: "Session completed too quickly. Consider abandoning instead.",
      code: "MINIMAL_COMPLETION",
    });
  }
  if (interruptions > 10) {
    result.data!.recommendedAction = "review";
    result.warnings.push({
      field: "interruptions",
      message: `High interruption count (${interruptions}) may affect session quality scoring.`,
      code: "HIGH_INTERRUPTIONS",
    });
  }
  if (anticheatFlags > 0) {
    result.data!.recommendedAction = "review";
    result.warnings.push({
      field: "anticheat",
      message: `${anticheatFlags} integrity concerns detected. Session may be flagged for review.`,
      code: "ANTICHEAT_FLAGS",
    });
  }
  if (elapsedTime > duration * 2) {
    result.data!.recommendedAction = "review";
    result.warnings.push({
      field: "elapsedTime",
      message:
        "Session duration significantly exceeds expected time. Please verify session integrity.",
      code: "EXCESSIVE_DURATION",
    });
  }
  return result;
}
