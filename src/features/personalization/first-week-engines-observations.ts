import type { Lane } from "../lane-engine/types";
import type { SessionProfile } from "./first-week-schemas";

export {
  type CompanionObservation,
  deriveCompanionObservation,
} from "./first-week-companion-observation";

export interface WeeklyRecommendation {
  headline: string;
  recommendation: string;
  whatHelped: string;
  whatGotInTheWay: string;
  bestNextSessionType: "study_block" | "clean_run" | "project_block" | "clean_session" | "recovery";
  suggestedAdjustment: string;
  nextAction: string;
  premiumDeeperInsight: string | null;
}

export interface DerivedPath {
  pathDescription: string;
}

export function deriveWeeklyRecommendation(
  lane: Lane,
  profile: SessionProfile,
  bossEngagement: string,
  studyUsageRatio: number,
): WeeklyRecommendation {
  const {
    consistencyScore,
    averageDurationMinutes,
    longestStreak,
    abandonments,
    completions,
  } = profile;

  if (lane === "student") {
    if (consistencyScore >= 0.7 && longestStreak >= 5) {
      return {
        headline: "Your study rhythm is solid. Here is the next step.",
        recommendation:
          "Increase session length from your average. Try adding 10 minutes of review at the end of each block.",
        whatHelped: `Consistent block length of ${averageDurationMinutes} minutes kept your rhythm steady.`,
        whatGotInTheWay: "No clear blocker detected — pattern was too uniform to isolate.",
        bestNextSessionType: "study_block",
        suggestedAdjustment: "Add 5-10 minutes of review to your existing study block length.",
        nextAction: "Start a study block with a review section at the end.",
        premiumDeeperInsight: "Deep Coach Memory could track specific topic improvement rates across your blocks.",
      };
    }
    if (studyUsageRatio >= 0.5) {
      return {
        headline: "You are using Study OS actively.",
        recommendation:
          "Try structuring sessions by topic — VEX can group your material if you tag your blocks.",
        whatHelped: "Active use of Study OS materials linked your sessions together.",
        whatGotInTheWay: "Untagged blocks make it harder to see topic-specific progress.",
        bestNextSessionType: "study_block",
        suggestedAdjustment: "Tag your next three study blocks by topic.",
        nextAction: "Start your next study block and tag the topic.",
        premiumDeeperInsight: "Advanced Study OS would auto-tag and group your material by detected topic patterns.",
      };
    }
    if (consistencyScore < 0.4) {
      return {
        headline: "Your study pattern is still forming.",
        recommendation: "Aim for two study blocks this week at the same time each day.",
        whatHelped: "Each completed block contributed signal — even scattered ones.",
        whatGotInTheWay: "Inconsistent timing made it harder to find your optimal window.",
        bestNextSessionType: "study_block",
        suggestedAdjustment: "Pick one consistent time slot for study blocks this week.",
        nextAction: "Schedule two study blocks at the same time this week.",
        premiumDeeperInsight: "Weekly Intelligence could track your optimal study windows over time.",
      };
    }
    return {
      headline: "Week one study data is in.",
      recommendation:
        "VEX recommends keeping study blocks under 50 minutes. Short, repeatable blocks build stronger memory.",
      whatHelped: `${completions} completed study blocks gave VEX enough data to see your learning style.`,
      whatGotInTheWay: "No major friction points detected in your first week.",
      bestNextSessionType: "study_block",
      suggestedAdjustment: "Keep blocks under 50 minutes for better retention.",
      nextAction: "Start your next study block from where you left off.",
      premiumDeeperInsight: null,
    };
  }

  if (lane === "game_like") {
    if (longestStreak >= 4 && bossEngagement === "high") {
      return {
        headline: "You are a streak builder.",
        recommendation:
          "Try running two shorter encounters instead of one long one. Streak stacking compounds faster.",
        whatHelped: `Your ${longestStreak}-encounter streak showed strong commitment.`,
        whatGotInTheWay: "Longer encounters may have sacrificed streak velocity.",
        bestNextSessionType: "clean_run",
        suggestedAdjustment: "Split long encounters into shorter stacked ones.",
        nextAction: "Run two 15-minute encounters instead of one 30-minute run.",
        premiumDeeperInsight: "Run Board would visualize your encounter stacking efficiency over time.",
      };
    }
    if (abandonments >= 2) {
      return {
        headline: "Some encounters went unfinished.",
        recommendation:
          "Start with a 15-minute warmup encounter before committing to longer runs.",
        whatHelped: "Even unfinished encounters contributed to VEX understanding your pace.",
        whatGotInTheWay: `${abandonments} abandoned encounters disrupted momentum.`,
        bestNextSessionType: "clean_run",
        suggestedAdjustment: "Always start with a warmup encounter.",
        nextAction: "Begin your next session with a short warmup run.",
        premiumDeeperInsight: null,
      };
    }
    return {
      headline: "Your Run Board is forming.",
      recommendation:
        "Focus on completion rate this week. Finishing encounters unlocks modifiers that keep things fresh.",
      whatHelped: `${completions} completed encounters built the foundation.`,
      whatGotInTheWay: "Progress tracking is still early — more sessions will refine the picture.",
      bestNextSessionType: "clean_run",
      suggestedAdjustment: "Prioritize encounter completion over duration.",
      nextAction: "Start a clean encounter and finish it — no matter the length.",
      premiumDeeperInsight: "Run Board would track your encounter stats across weeks.",
    };
  }

  if (lane === "deep_creative") {
    if (profile.savedNextMoves >= 3) {
      return {
        headline: "You are protecting creative continuity.",
        recommendation:
          "Try a focused 90-minute project block with one saved next move at the end.",
        whatHelped: `${profile.savedNextMoves} saved next moves kept your project threads alive.`,
        whatGotInTheWay: "Shorter blocks may limit how deep your sessions can go.",
        bestNextSessionType: "project_block",
        suggestedAdjustment: "Extend one project block to find deeper flow.",
        nextAction: "Schedule one extended project block this week with a next-move saved at the end.",
        premiumDeeperInsight: "Project Focus Path would track creative depth metrics and suggest optimal block lengths.",
      };
    }
    if (averageDurationMinutes < 30) {
      return {
        headline: "Your project blocks are short.",
        recommendation: "Try extending one session to 60 minutes this week.",
        whatHelped: `${completions} completed project blocks showed consistent engagement.`,
        whatGotInTheWay: `Short blocks (avg ${averageDurationMinutes} min) may prevent deeper creative flow.`,
        bestNextSessionType: "project_block",
        suggestedAdjustment: "Protect one longer project block this week.",
        nextAction: "Choose one project and protect a 60-minute block for it.",
        premiumDeeperInsight: null,
      };
    }
    return {
      headline: "Your creative flow has a shape.",
      recommendation: "Protect one project block at the same time each day.",
      whatHelped: "Regular sessions created a reliable creative container.",
      whatGotInTheWay: "No major blockers — pattern needs more sessions to deepen analysis.",
      bestNextSessionType: "project_block",
      suggestedAdjustment: "Lock in a daily project time slot.",
      nextAction: "Start your next project session at your best time-of-day.",
      premiumDeeperInsight: "Project Focus Path would track creative flow peaks across your schedule.",
    };
  }

  if (consistencyScore >= 0.85) {
    return {
      headline: "Your quiet rhythm is unusually consistent.",
      recommendation:
        "Keep doing what works. Add one focused-morning session if you want to experiment.",
      whatHelped: "Extraordinary consistency across all sessions — your rhythm is reliable.",
      whatGotInTheWay: "No friction detected — your clean pattern is working.",
      bestNextSessionType: "clean_session",
      suggestedAdjustment: "Experiment with one morning session for variety.",
      nextAction: "Try starting one session in the morning this week.",
      premiumDeeperInsight: "Weekly Intelligence could compare this week's consistency to next week's.",
    };
  }
  return {
    headline: "Seven clean sessions tell a story.",
    recommendation:
      "VEX noticed you finish what you start. Keep the container reliable.",
    whatHelped: `${completions} sessions completed — consistency is your strength.`,
    whatGotInTheWay: "No significant blockers in your first week — rhythm is forming cleanly.",
    bestNextSessionType: "clean_session",
    suggestedAdjustment: "No change needed. Your rhythm works.",
    nextAction: "Start your next clean session when ready.",
    premiumDeeperInsight: null,
  };
}
