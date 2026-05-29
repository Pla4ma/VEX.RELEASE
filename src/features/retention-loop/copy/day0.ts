import type { JourneyDayCopy } from "../schemas";

export const DAY0_COPY: JourneyDayCopy = {
  homeMessage: {
    student: "VEX helps you study the right thing next.",
    game_like: "VEX turns focus into momentum without cheap rewards.",
    deep_creative: "VEX helps you pick up deep work where you left off.",
    minimal_normal: "VEX helps you start one useful action without noise.",
  },
  primaryCta: {
    student: "Start first study block",
    game_like: "Start first run",
    deep_creative: "Start first project session",
    minimal_normal: "Start first clean block",
  },
  // No notification on Day 0 — first hook comes from completion screen only
  notificationCopy: {
    title: {
      student: "",
      game_like: "",
      deep_creative: "",
      minimal_normal: "",
    },
    body: {
      student: "",
      game_like: "",
      deep_creative: "",
      minimal_normal: "",
    },
  },
  sessionSuggestion: {
    student: {
      durationMinutes: 15,
      type: "STUDY",
      taskPrompt: "Name one topic. Study it for 15 minutes. VEX learns your style.",
    },
    game_like: {
      durationMinutes: 15,
      type: "SPRINT",
      taskPrompt: "One task. 15 minutes. Treat it as a single clean encounter.",
    },
    deep_creative: {
      durationMinutes: 20,
      type: "DEEP_WORK",
      taskPrompt: "Open one project. Name the next concrete step. 20 minutes.",
    },
    minimal_normal: {
      durationMinutes: 10,
      type: "LIGHT_FOCUS",
      taskPrompt: "Pick one small task. 10 minutes. That is enough to start.",
    },
  },
  completionPayoff: {
    student: "First study block done. VEX saw your topic choice and study style.",
    game_like: "First encounter done. VEX saw your focus pattern and session length.",
    deep_creative: "First project session done. VEX saved your next move and thread.",
    minimal_normal: "First block done. VEX saw your task choice and time window.",
  },
  nextActionCopy: {
    student: "Return tomorrow. VEX will suggest the next topic based on today.",
    game_like: "Return tomorrow. VEX will suggest an encounter based on today's pattern.",
    deep_creative: "Return tomorrow. VEX will surface the next move from your handoff.",
    minimal_normal: "Return tomorrow. VEX will suggest a task based on today's choice.",
  },
  premiumTrigger: { day: 0, trigger: "none", copyKey: "none" },
  returnReason: {
    student: "VEX remembers you study with focus. Return to build the rhythm.",
    game_like: "VEX remembers how you run. Return to keep moving.",
    deep_creative: "VEX remembers your project flow. Return to continue building.",
    minimal_normal: "VEX remembers your clean rhythm. Return when ready.",
  },
};
