import type { JourneyDayCopy } from "../schemas";

export const DAY4_COPY: JourneyDayCopy = {
  homeMessage: {
    student: "Need a tiny start today?",
    game_like: "Need a recovery encounter?",
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
      taskPrompt: "Recovery encounter: survive 10 clean minutes.",
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
      game_like: "Need a recovery encounter?",
      deep_creative: "Need a re-entry?",
      minimal_normal: "Need a tiny start?",
    },
    body: {
      student: "8-minute review. Just one section. No pressure.",
      game_like: "10-minute recovery encounter. Just move.",
      deep_creative: "7 minutes. Just find the next move.",
      minimal_normal: "5-minute block. That is enough.",
    },
  },
  premiumTrigger: { day: 4, trigger: "none", copyKey: "none" },
  returnReason: {
    student: "VEX respects that some days are harder. Return when ready.",
    game_like: "Recovery is part of the run. VEX will be here when you return.",
    deep_creative: "Creative work is not always linear. VEX holds your thread.",
    minimal_normal: "Clean means not forcing it. VEX will be here when you return.",
  },
};
