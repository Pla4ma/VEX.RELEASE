import type { ActiveStudyPlan } from "../../../features/content-study/hooks/helpers";
import type { useActiveBoss } from "../../../features/boss/hooks";
import type { useProgressionSummary } from "../../../features/progression/hooks";
import type { useStreakSummary } from "../../../features/streaks/hooks";

export type RecommendationType =
  | "focus_session"
  | "study_plan"
  | "comeback"
  | "protect_streak"
  | "boss_battle"
  | "start_streak";

export type UrgencyLevel = "low" | "medium" | "high" | "critical";

export type HomeRecommendation = {
  id: string;
  type: RecommendationType;
  priority: number;
  urgency: UrgencyLevel;
  headline: string;
  subtext: string;
  ctaText: string;
  ctaAction: "start_focus" | "start_study" | "view_boss" | "view_streak";
  ctaParams?: Record<string, unknown>;
  aiCoachMessage?: string;
  visualCue?: "none" | "pulse" | "glow" | "urgent";
  expiresAt?: number;
  evidence?: {
    memoryIds?: string[];
    fallbackReason?: string;
    confidence?: number;
  };
};

type HookStreakSummary = NonNullable<
  ReturnType<typeof useStreakSummary>["data"]
>;
type HookProgressionSummary = NonNullable<
  ReturnType<typeof useProgressionSummary>["data"]
>;
type HookBossEncounter = NonNullable<ReturnType<typeof useActiveBoss>["data"]>;

export type RecommendationContext = {
  userId: string;
  currentTime: Date;
  streak: HookStreakSummary | null;
  progression: HookProgressionSummary | null;
  activeStudyPlan: ActiveStudyPlan | null;
  activeBoss: HookBossEncounter | null;
  hasCompletedSessionToday: boolean;
  lastSessionTimestamp?: number;
  totalSessions: number;
  currentLevel: number;
};

export type RecommendationRule = {
  name: string;
  priority: number;
  condition: (ctx: RecommendationContext) => boolean;
  generate: (ctx: RecommendationContext) => HomeRecommendation;
};
