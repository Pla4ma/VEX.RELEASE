import { launchColors } from "@theme/tokens/launch-colors";

export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

export interface ErrorState {
  message: string;
  wittyMessage: string;
  icon: string;
  severity: "low" | "medium" | "high";
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
};

export const ERROR_MESSAGES: Record<string, ErrorState> = {
  session: {
    message: "Session sync failed",
    wittyMessage: "The digital realm is experiencing turbulence. Your focus remains intact.",
    icon: "\u26A1",
    severity: "medium",
  },
  purchase: {
    message: "Purchase processing delayed",
    wittyMessage: "The treasure chest is stuck. Our gnomes are working on it.",
    icon: "\uD83D\uDC8E",
    severity: "high",
  },
  sync: {
    message: "Data sync incomplete",
    wittyMessage: "Your progress is safe on this device. We'll sync when the stars align.",
    icon: "\uD83D\uDCE1",
    severity: "low",
  },
  network: {
    message: "Connection interrupted",
    wittyMessage: "The connection elves are on a coffee break. They'll return.",
    icon: "\uD83C\uDF10",
    severity: "medium",
  },
  general: {
    message: "Something went wrong",
    wittyMessage: "Even the ancient algorithms need a moment sometimes.",
    icon: "\uD83D\uDD2E",
    severity: "medium",
  },
};

export const getErrorMessage = (error: Error | string, fallback: string): string => {
  if (typeof error === "string") return error;
  return error.message || fallback;
};

export const getRetryDelay = (
  retryCount: number,
  config: RetryConfig,
): number => {
  return Math.min(
    config.baseDelay * Math.pow(config.backoffMultiplier, retryCount),
    config.maxDelay,
  );
};
