import * as Haptics from "expo-haptics";
import { type SharedValue, withSpring, withSequence, withTiming } from "react-native-reanimated";
import * as Sentry from "@sentry/react-native";
import { eventBus } from "@/events";


export function getErrorRecovery(error: Error, context: string): ErrorRecovery {
  const recoveries: Record<string, ErrorRecovery> = {
    NETWORK_ERROR: {
      friendlyMessage: 'Connection lost - your progress is safe',
      actionText: 'Retry',
      actionType: 'RETRY',
      encouragement: 'Even Focus Masters face interference. Try again!',
    },
    SESSION_INTERRUPTED: {
      friendlyMessage: 'Session ended early',
      actionText: 'Start Fresh Session',
      actionType: 'CONTINUE',
      encouragement: 'One setback doesn\'t define your journey. Keep going!',
    },
    STREAK_BROKEN: {
      friendlyMessage: 'Your streak has ended',
      actionText: 'Begin Comeback',
      actionType: 'CONTINUE',
      encouragement: 'Comebacks are stronger than streaks. Prove it!',
    },
  };

  return recoveries[context] || {
    friendlyMessage: 'Something went wrong',
    actionText: 'Try Again',
    actionType: 'RETRY',
    encouragement: 'Every expert was once a beginner. Keep trying!',
  };
}