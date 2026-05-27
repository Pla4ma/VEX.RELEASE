export interface InterventionScenario {
  id: string;
  name: string;
  condition: () => boolean;
  message: InterventionMessage;
  action?: InterventionAction;
}

export interface InterventionMessage {
  content: string;
  tone: "supportive" | "urgent" | "motivational" | "strategic";
  quickResponses: string[];
}

export interface InterventionAction {
  type: "SUGGEST_SESSION" | "AUTO_CREATE_SESSION" | "SEND_NOTIFICATION";
  data: Record<string, unknown>;
}

export interface BurnoutInput {
  sessionsLast24h: number;
  avgQualityLast24h: number;
  lastSessionCompletedAt: number;
}

export interface PlateauInput {
  xpGrowthRate7d: number;
  xpGrowthRatePrev7d: number;
  currentLevel: number;
  sessionsPerWeekTrend: "INCREASING" | "STABLE" | "DECREASING";
}

export interface StreakRescueInput {
  streakDays: number;
  hoursUntilStreakBreak: number;
  lastSessionHours: number;
  hasActiveSession: boolean;
}

export interface BossStrategyInput {
  bossHealthPercent: number;
  bossTimeRemaining: number;
  currentStreakMultiplier: number;
  userLevel: number;
}

export interface BossStrategy {
  recommendedDuration: number;
  targetQuality: "S" | "A" | "B";
  expectedDamage: number;
}

export interface StudyBehindInput {
  studyPlanProgress: number;
  daysBehindSchedule: number;
  planName: string;
}

export interface BossOpportunityInput {
  bossHealthPercent: number;
  bossTimeRemaining: number;
  currentStreakMultiplier: number;
}

export interface MomentumBuildingInput {
  streakDays: number;
  sessionsToday: number;
  lastSessionQuality: number;
}

export interface ComebackReadyInput {
  daysSinceStreakBreak: number;
  previousStreakLength: number;
  hasAttemptedComeback: boolean;
}

export interface StudyPlanCompleteInput {
  planName: string;
  totalTasks: number;
  completionTimeDays: number;
}

export interface StudyStuckInput {
  documentId: string;
  documentName: string;
  minutesOnSameSection: number;
  lastInteractionAt: number;
  sectionName?: string;
}

export interface DistractionDetectedInput {
  sessionId: string;
  currentPurityScore: number;
  purityScoreTrend: "IMPROVING" | "STABLE" | "DECLINING";
  pausesInLast10Min: number;
  backgroundSwitches: number;
}

export interface OptimalBreakInput {
  sessionDuration: number;
  currentPurityScore: number;
  focusPattern: "DEEP" | "MODERATE" | "FRAGMENTED";
  timeSinceLastBreak: number;
  userPreferredBreakInterval?: number;
}

export type CoachPersona = "MENTOR" | "CHEERLEADER" | "DRILL_SERGEANT";
