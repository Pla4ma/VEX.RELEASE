export interface LoadingState {
  message: string;
  progress?: number;
  tip?: string;
  estimatedTime?: number;
}

export function getLoadingState(
  context: "INITIALIZING" | "SYNCING" | "MATCHMAKING",
): LoadingState {
  const messages: Record<typeof context, string[]> = {
    INITIALIZING: [
      "Calibrating focus sensors...",
      "Loading your mastery data...",
      "Preparing today's challenges...",
      "Syncing with the void...",
    ],
    SYNCING: [
      "Syncing your progress...",
      "Updating leaderboards...",
      "Fetching squad status...",
      "Loading daily dungeon...",
    ],
    MATCHMAKING: [
      "Finding worthy opponents...",
      "Scanning for active squads...",
      "Preparing the arena...",
      "Summoning raid participants...",
    ],
  };
  const tips = [
    "Tip: Deep work sessions are 3x more effective in the morning",
    "Tip: Taking breaks every 90 minutes improves retention",
    "Tip: Your streak is a commitment to your future self",
    "Tip: 25 minutes of focus beats 2 hours of distraction",
  ];

  const contextMessages = messages[context] ?? messages.INITIALIZING;
  return {
    message:
      contextMessages[Math.floor(Math.random() * contextMessages.length)] ??
      contextMessages[0]!,
    tip: tips[Math.floor(Math.random() * tips.length)] ?? tips[0]!,
  };
}

export interface ErrorRecovery {
  friendlyMessage: string;
  actionText: string;
  actionType: "RETRY" | "GO_BACK" | "CONTINUE" | "CONTACT_SUPPORT";
  encouragement: string;
}

export function getErrorRecovery(
  _error: Error,
  context: string,
): ErrorRecovery {
  const recoveries: Record<string, ErrorRecovery> = {
    NETWORK_ERROR: {
      friendlyMessage: "Connection lost - your progress is safe",
      actionText: "Retry",
      actionType: "RETRY",
      encouragement: "Even Focus Masters face interference. Try again!",
    },
    SESSION_INTERRUPTED: {
      friendlyMessage: "Session ended early",
      actionText: "Start Fresh Session",
      actionType: "CONTINUE",
      encouragement: "One setback doesn't define your journey. Keep going!",
    },
    STREAK_BROKEN: {
      friendlyMessage: "Your streak has ended",
      actionText: "Begin Comeback",
      actionType: "CONTINUE",
      encouragement: "Comebacks are stronger than streaks. Prove it!",
    },
  };
  return (
    recoveries[context] ?? {
      friendlyMessage: "Something went wrong",
      actionText: "Try Again",
      actionType: "RETRY",
      encouragement: "Every expert was once a beginner. Keep trying!",
    }
  );
}
