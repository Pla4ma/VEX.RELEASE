import type { FirstWeekExperience } from "../../../features/personalization/first-week-schemas";
import type {
  BehaviorStats,
  FeatureAvailabilitySnapshot,
  MotivationStyle,
  VexExperience,
} from "../../../features/personalization/schemas";
import type { LaneProfile } from "../../../features/lane-engine/types";

export interface HomeResolvedExperience {
  resolvedExperience: VexExperience;
  firstWeekExperience: FirstWeekExperience;
  laneProfile: LaneProfile;
  personalizationProfile: {
    motivationStyle: MotivationStyle;
    primaryGoal: string;
    gamificationIntensity: "minimal" | "medium" | "strong";
    studyLayerName: string;
    userStage: "new" | "activating" | "engaged" | "power";
  };
  behaviorStats: {
    totalCompletedSessions: number;
    studyUsageRatio: number;
    deepWorkUsageRatio: number;
    learningUsageRatio: number;
    projectFocusUsageRatio: number;
    structuredExecutionUsageRatio: number;
    bossChallengeEngagement: "none" | "low" | "medium" | "high";
    coachInteractions: number;
    comebackSessions: number;
    ignoredFeatures: string[];
    premiumFeatureAttempts: string[];
    completionStreak: number;
  };
}

export interface SessionEntry {
  status?: string;
  duration?: number;
  effectiveDuration?: number;
  mode?: string;
  endedAt?: number;
  startTime?: number;
  focusQuality?: number;
  config?: { sessionMode?: string; studyPlanId?: string };
}

export interface ActiveBossData {
  id?: string;
  name?: string;
  maxHealth?: number;
  damageTaken?: number;
  encounters?: number;
  currentHealth?: number;
}

export interface ActiveStudyPlanData {
  id?: string;
  title?: string;
}

export interface LegacySessionData {
  endedAt?: number;
}

export type HomeFeatureAvailability = FeatureAvailabilitySnapshot;
export type HomeBehaviorStats = BehaviorStats;
