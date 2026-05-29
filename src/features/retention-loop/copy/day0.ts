import type { JourneyDayCopy } from "../schemas";

export const DAY0_COPY: JourneyDayCopy = {
  homeMessage: {
    student: "Start one study block. VEX learns from real sessions.",
    game_like: "Start one run. VEX learns from how you move.",
    deep_creative: "Start one project block. VEX learns from your next move.",
    minimal_normal: "Start one clean block. VEX learns from how you work.",
  },
  primaryCta: {
    student: "Start first study block",
    game_like: "Start first run",
    deep_creative: "Start first project session",
    minimal_normal: "Start first clean block",
  },
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
      taskPrompt: "One task. 15 minutes. Name the target and start moving.",
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
    student: "First study block done. VEX saved your topic and is learning your review pattern.",
    game_like: "First run done. VEX saw your focus pattern and session length.",
    deep_creative: "First project session done. VEX saved your next move and thread.",
    minimal_normal: "First block done. VEX saw your task choice and time window.",
  },
  nextActionCopy: {
    student: "Your next study block is ready. Return tomorrow to continue the review rhythm.",
    game_like: "Your next clean run is ready. Return tomorrow to build momentum.",
    deep_creative: "Your project is waiting at the next move. Return tomorrow to continue.",
    minimal_normal: "One clean action is ready. Return tomorrow when you're ready.",
  },
  premiumTrigger: { day: 0, trigger: "none", copyKey: "none" },
  returnReason: {
    student: "VEX is learning what I need to study or review next.",
    game_like: "VEX is learning how to help me build momentum.",
    deep_creative: "VEX is learning where I left off.",
    minimal_normal: "VEX is learning to give me one useful action.",
  },
};
