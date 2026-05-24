import type { NotificationRule } from "./SmartNotificationSystem.types";

export const STREAK_PROTECTION_RULE: NotificationRule = {
  type: "STREAK_PROTECTION",
  priority: "CRITICAL",
  condition: (ctx) => {
    if (!ctx.streakDays || ctx.hasCompletedSessionToday) {
      return false;
    }
    if (ctx.hoursUntilStreakBreak === null) {
      return false;
    }
    return ctx.hoursUntilStreakBreak <= 4;
  },
  message: (ctx) => {
    const hours = Math.ceil(ctx.hoursUntilStreakBreak || 0);
    if (hours <= 1) {
      return {
        title: "\uD83D\uDEA8 Streak breaks in 1 hour!",
        body: `Your ${ctx.streakDays}-day streak is about to break. Start a quick session now!`,
        data: { urgency: "critical", streakDays: ctx.streakDays },
      };
    }
    return {
      title: `\u23F0 ${hours} hours to save your streak`,
      body: `Protect your ${ctx.streakDays}-day streak with a quick focus session.`,
      data: {
        urgency: "high",
        streakDays: ctx.streakDays,
        hoursRemaining: hours,
      },
    };
  },
  maxPerDay: 2,
  cooldownHours: 2,
  quietHoursRespected: false,
  requiresOptIn: false,
};

export const BOSS_OPPORTUNITY_RULE: NotificationRule = {
  type: "BOSS_OPPORTUNITY",
  priority: "HIGH",
  condition: (ctx) => {
    if (!ctx.hasActiveBoss) {
      return false;
    }
    if (ctx.bossHealthPercent > 30) {
      return false;
    }
    if (ctx.bossTimeRemaining <= 0) {
      return false;
    }
    return ctx.isPrimeTime || ctx.bossHealthPercent < 15;
  },
  message: (ctx) => {
    const health = Math.round(ctx.bossHealthPercent);
    const time = Math.round(ctx.bossTimeRemaining);
    return {
      title: `\u2694\uFE0F Boss at ${health}% health!`,
      body: ctx.isPrimeTime
        ? `Prime Time active! Deal bonus damage for ${time} more hours.`
        : `One focused session could finish this. ${time} hours remaining.`,
      data: {
        bossHealth: health,
        timeRemaining: time,
        isPrimeTime: ctx.isPrimeTime,
      },
    };
  },
  maxPerDay: 1,
  cooldownHours: 6,
  quietHoursRespected: true,
  requiresOptIn: true,
};

export const STUDY_REMINDER_RULE: NotificationRule = {
  type: "STUDY_REMINDER",
  priority: "MEDIUM",
  condition: (ctx) => {
    if (!ctx.hasActiveStudyPlan) {
      return false;
    }
    if (ctx.studyPlanProgress > 0.8) {
      return false;
    }
    if (ctx.studyTasksRemaining === 0) {
      return false;
    }
    if (ctx.hasCompletedSessionToday) {
      return false;
    }
    return true;
  },
  message: (ctx) => ({
    title: "\uD83D\uDCDA Continue your study plan",
    body: `${ctx.studyTasksRemaining} tasks remaining. One session makes real progress.`,
    data: {
      tasksRemaining: ctx.studyTasksRemaining,
      progress: ctx.studyPlanProgress,
    },
  }),
  maxPerDay: 1,
  cooldownHours: 24,
  quietHoursRespected: true,
  requiresOptIn: true,
};

export const SQUAD_ACTIVITY_RULE: NotificationRule = {
  type: "SQUAD_ACTIVITY",
  priority: "LOW",
  condition: (ctx) => {
    if (ctx.squadMemberCount < 2) {
      return false;
    }
    if (ctx.squadWeeklyProgress > 0.9) {
      return false;
    }
    return true;
  },
  message: (ctx) => {
    const progress = Math.round(ctx.squadWeeklyProgress);
    return {
      title: "\uD83D\uDC65 Squad needs you!",
      body: `Your squad is at ${progress}% of their weekly goal. Join a session and contribute!`,
      data: { squadProgress: progress },
    };
  },
  maxPerDay: 1,
  cooldownHours: 48,
  quietHoursRespected: true,
  requiresOptIn: true,
};

export const COMEBACK_RULE: NotificationRule = {
  type: "COMEBACK",
  priority: "HIGH",
  condition: (ctx) => {
    if (!ctx.lastSessionAt) {
      return false;
    }
    return ctx.daysSinceLastSession >= 3 && ctx.daysSinceLastSession <= 14;
  },
  message: (ctx) => {
    const days = ctx.daysSinceLastSession;
    if (days <= 3) {
      return {
        title: "We miss you! \uD83D\uDC99",
        body: "Life happens. When you're ready, your streak can start again.",
        data: { daysAbsent: days },
      };
    }
    if (days <= 7) {
      return {
        title: "Your progress is waiting \uD83C\uDF31",
        body: "You were building something great. Ready to continue?",
        data: { daysAbsent: days },
      };
    }
    return {
      title: "Fresh start, same you \u2728",
      body: "New boss available. Perfect time to jump back in!",
      data: { daysAbsent: days },
    };
  },
  maxPerDay: 1,
  cooldownHours: 72,
  quietHoursRespected: true,
  requiresOptIn: false,
};

export const NOTIFICATION_RULES: NotificationRule[] = [
  STREAK_PROTECTION_RULE,
  BOSS_OPPORTUNITY_RULE,
  STUDY_REMINDER_RULE,
  SQUAD_ACTIVITY_RULE,
  COMEBACK_RULE,
];
