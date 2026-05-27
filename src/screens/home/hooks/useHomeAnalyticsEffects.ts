import { useEffect, useRef } from "react";

import type {
  FeatureKey,
  UserExperienceStage,
} from "../../../features/liveops-config";

export function useHomeAnalyticsEffects(input: {
  analytics: {
    trackFeatureUnlocked: (
      feature: FeatureKey,
      stage: UserExperienceStage,
    ) => void;
    trackSessionMilestone: (userId: string, count: number) => void;
  };
  features: Record<string, { isUnlocked: boolean }>;
  stage: UserExperienceStage;
  totalCompletedSessions: number;
  userId: string;
}) {
  const { analytics, features, stage, totalCompletedSessions, userId } = input;
  const trackedSessionsRef = useRef(0);
  const unlockedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (
      !userId ||
      totalCompletedSessions <= trackedSessionsRef.current ||
      totalCompletedSessions > 3
    ) {
      return;
    }

    trackedSessionsRef.current = totalCompletedSessions;
    analytics.trackSessionMilestone(userId, totalCompletedSessions);
  }, [analytics, totalCompletedSessions, userId]);

  useEffect(() => {
    Object.entries(features).forEach(([feature, access]) => {
      if (access.isUnlocked && !unlockedRef.current.has(feature)) {
        unlockedRef.current.add(feature);
        analytics.trackFeatureUnlocked(feature as FeatureKey, stage);
      }
    });
  }, [analytics, features, stage]);
}
