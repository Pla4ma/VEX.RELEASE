import type { JourneyDayCopy } from "../schemas";

export const DAY0_COPY: JourneyDayCopy = {
  homeMessage: {
    student: "Let VEX understand how you learn.",
    game_like: "Let VEX match how you move.",
    deep_creative: "Let VEX understand your project flow.",
    minimal_normal: "Let VEX match your rhythm.",
  },
  primaryCta: {
    student: "Start first study block",
    game_like: "Start first run",
    deep_creative: "Start first project session",
    minimal_normal: "Start first clean block",
  },
  sessionSuggestion: {
    student: {
      durationMinutes: 15,
      type: "STUDY",
      taskPrompt: "Name one topic to review. 15 minutes — start simple.",
    },
    game_like: {
      durationMinutes: 15,
      type: "SPRINT",
      taskPrompt: "One encounter. 15 minutes. Just move.",
    },
    deep_creative: {
      durationMinutes: 20,
      type: "DEEP_WORK",
      taskPrompt: "Open one project. Name the next concrete step.",
    },
    minimal_normal: {
      durationMinutes: 10,
      type: "LIGHT_FOCUS",
      taskPrompt: "Pick one small task. 10 minutes. That is enough.",
    },
  },
  completionPayoff: {
    student: "First block complete. VEX saw how you study.",
    game_like: "First run done. VEX saw how you move.",
    deep_creative: "First project session done. VEX saw how you build.",
    minimal_normal: "First block done. VEX saw your rhythm.",
  },
  nextActionCopy: {
    student: "Return tomorrow. VEX will have a focused study block ready.",
    game_like: "Return tomorrow. VEX will have your next run ready.",
    deep_creative: "Return tomorrow. VEX will have your project thread waiting.",
    minimal_normal: "Return tomorrow. VEX will have one clean block ready.",
  },
  premiumTrigger: { day: 0, trigger: "none", copyKey: "none" },
  returnReason: {
    student: "VEX remembers you study with focus. Return to build the rhythm.",
    game_like: "VEX remembers how you run. Return to keep moving.",
    deep_creative: "VEX remembers your project flow. Return to continue building.",
    minimal_normal: "VEX remembers your clean rhythm. Return when ready.",
  },
};
