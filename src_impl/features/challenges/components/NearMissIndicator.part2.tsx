import React, { useEffect } from "react";
import Animated, { useSharedValue, useAnimatedStyle, withDelay, withSpring, withTiming, withRepeat, withSequence, FadeInUp, FadeIn } from "react-native-reanimated";
import { Box, Text, Button } from "@/components/primitives";
import { useTheme } from "@/theme";
import * as Sentry from "@sentry/react-native";
import { getAnalyticsService } from "@/analytics/AnalyticsService";


export function trackChallengeNearMiss(challengeId: string, progressPercent: number): void {
  Sentry.addBreadcrumb({
    category: 'challenges',
    message: 'Challenge near-miss recorded',
    level: 'info',
    data: {
      challengeId,
      progressPercent,
      threshold: NEAR_MISS_THRESHOLD,
      type: 'near_miss',
    },
  });

  getAnalyticsService().track('challenge_near_miss', {
    challenge_id: challengeId,
    progress_percent: progressPercent,
    miss_by_percent: 100 - progressPercent,
  });
}

export function useIsNearMiss(progressPercent: number, status: 'completed' | 'expired' | 'failed'): boolean {
  return status === 'expired' && progressPercent >= NEAR_MISS_THRESHOLD && progressPercent < COMPLETE_THRESHOLD;
}