import type { JourneyDayCopy } from "../schemas";

export const DAY1_COPY: JourneyDayCopy = {
  homeMessage: {
    student: "Pick up with one focused study block.",
    game_like: "Your next clean run is ready.",
    deep_creative: "Your project thread is waiting at the next move.",
    minimal_normal: "One clean block is enough today.",
  },
  primaryCta: {
    student: "Start 15-min study block",
    game_like: "Start 15-min run",
    deep_creative: "Continue project thread",
    minimal_normal: "Start 10-min block",
  },
  sessionSuggestion: {
    student: {
      durationMinutes: 15,
      type: "STUDY",
      taskPrompt: "Pick up where yesterday's review left off. One topic, 15 minutes.",
    },
    game_like: {
      durationMinutes: 15,
      type: "SPRINT",
      taskPrompt: "One clean encounter. No boss. Just rhythm.",
    },
    deep_creative: {
      durationMinutes: 20,
      type: "DEEP_WORK",
      taskPrompt: "Re-enter your project. Identify the next concrete move.",
    },
    minimal_normal: {
      durationMinutes: 10,
      type: "LIGHT_FOCUS",
      taskPrompt: "One short block. Same task or new — whatever feels right.",
    },
  },
  completionPayoff: {
    student: "Rhythm starting. Two days of study in a row.",
    game_like: "Rhythm forming. Two runs in the books.",
    deep_creative: "Continuity building. You have returned to the project.",
    minimal_normal: "Momentum: two blocks. VEX is learning your pace.",
  },
  nextActionCopy: {
    student: "Tomorrow VEX will show you what you have built in study so far.",
    game_like: "Tomorrow VEX will show your run progress.",
    deep_creative: "Tomorrow VEX will show your project continuity.",
    minimal_normal: "Tomorrow VEX will show your simple progress.",
  },
  notificationCopy: {
    title: {
      student: "One study block waiting",
      game_like: "One run ready",
      deep_creative: "Project thread waiting",
      minimal_normal: "One block ready",
    },
    body: {
      student: "15-minute study block. One topic. You got this.",
      game_like: "Clean encounter. 15 minutes. Just move.",
      deep_creative: "Re-enter the project. One concrete step.",
      minimal_normal: "10-minute block. Start when ready.",
    },
  },
  premiumTrigger: { day: 1, trigger: "none", copyKey: "none" },
  returnReason: {
    student: "You have started a study rhythm. VEX is learning your pace.",
    game_like: "You have built movement momentum. VEX remembers your runs.",
    deep_creative: "You have started project continuity. VEX tracks your thread.",
    minimal_normal: "You have a clean rhythm. VEX respects your pace.",
  },
};
