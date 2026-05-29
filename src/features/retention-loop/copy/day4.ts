import type { JourneyDayCopy } from "../schemas";

export const DAY4_COPY: JourneyDayCopy = {
  homeMessage: {
    student: "Need a tiny start today?",
    game_like: "Need a recovery run?",
    deep_creative: "Need a re-entry path?",
    minimal_normal: "Need a tiny start?",
  },
  primaryCta: {
    student: "Start a short review",
    game_like: "Start a recovery run",
    deep_creative: "Re-enter the project",
    minimal_normal: "Start 5-minute block",
  },
  sessionSuggestion: {
    student: {
      durationMinutes: 8,
      type: "RECOVERY",
      taskPrompt: "Review one weak section for 8 minutes. That is enough today.",
    },
    game_like: {
      durationMinutes: 10,
      type: "RECOVERY",
      taskPrompt: "Recovery run: 10 clean minutes. No targets, just move.",
    },
    deep_creative: {
      durationMinutes: 7,
      type: "RECOVERY",
      taskPrompt: "Re-enter the project. Only identify the next move. 7 minutes.",
    },
    minimal_normal: {
      durationMinutes: 5,
      type: "RECOVERY",
      taskPrompt: "Do 5 minutes. Stop cleanly. That is enough.",
    },
  },
  completionPayoff: {
    student: "Sometimes the hardest session is just starting. You did it.",
    game_like: "Recovery is not failure. It is return. You did it.",
    deep_creative: "Re-entry is progress. You found your way back.",
    minimal_normal: "Even five minutes counts. You kept the rhythm alive.",
  },
  nextActionCopy: {
    student: "Tomorrow VEX will show your study lane forming more clearly.",
    game_like: "Tomorrow VEX will show your run path emerging more clearly.",
    deep_creative: "Tomorrow VEX will show your project lane forming more clearly.",
    minimal_normal: "Tomorrow VEX will show your clean pattern more clearly.",
  },
  notificationCopy: {
    title: {
      student: "Need a tiny start?",
    game_like: "Need a recovery run?",
      deep_creative: "Need a re-entry?",
      minimal_normal: "Need a tiny start?",
    },
    body: {
      student: "8-minute review. Just one section. No pressure.",
      game_like: "10-minute recovery run. Just move.",
      deep_creative: "7 minutes. Just find the next move.",
      minimal_normal: "5-minute block. That is enough.",
    },
  },
  premiumTrigger: { day: 4, trigger: "none", copyKey: "none" },
  returnReason: {
    student: "VEX knows what I need to study or review next.",
    game_like: "VEX helps me build momentum and understand what blocks me.",
    deep_creative: "VEX remembers where I left off.",
    minimal_normal: "VEX gives me one useful action without noise.",
  },
};
