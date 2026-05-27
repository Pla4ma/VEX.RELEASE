import { buildActiveSessionHeroViewModel } from "../active-session-hero-view-model";
import type { ActiveSessionDisplayPolicy } from "../active-session-display-policy";

export { buildActiveSessionHeroViewModel };

export const basePolicy: ActiveSessionDisplayPolicy = {
  heroDensity: "minimal",
  showBossHUD: false,
  showBossTinyIndicator: false,
  showCoachBanner: false,
  showCompanionLayer: false,
  showContractReminder: false,
  showDailyProgress: false,
  showModeOverlay: false,
  showMomentumScore: false,
  showPurityScore: false,
  showStudyTarget: false,
};

export const baseInput = {
  completionPercentage: 42,
  dailyProgress: 50,
  displayPolicy: basePolicy,
  elapsedSeconds: 120,
  isReducedMotion: false,
  lanePresentation: null,
  momentumScores: [75, 80, 85],
  perfectFocusActive: true,
  phaseAccent: "blue",
  phaseIcon: "clock" as const,
  phaseLabel: "Focus",
  purityLabel: "Elite" as const,
  purityScore: 95,
  remainingSeconds: 600,
  streakMultiplier: 2.5,
  studyTargetLabel: "Study target",
  todayFocusSeconds: 3600,
};
