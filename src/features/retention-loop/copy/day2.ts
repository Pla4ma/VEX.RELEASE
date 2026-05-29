import type { JourneyDayCopy } from "../schemas";

export const DAY2_COPY: JourneyDayCopy = {
  homeMessage: {
    student: "You already built something. Two study blocks.",
    game_like: "Proof of movement. Two clean runs.",
    deep_creative: "Proof of progress. Two project sessions.",
    minimal_normal: "Proof of rhythm. Two clean blocks.",
  },
  primaryCta: {
    student: "Continue your study practice",
    game_like: "Continue your run practice",
    deep_creative: "Continue your project practice",
    minimal_normal: "Continue your clean practice",
  },
  sessionSuggestion: {
    student: {
      durationMinutes: 20,
      type: "STUDY",
      taskPrompt: "Review your strongest topic first, then tackle one weak area.",
    },
    game_like: {
      durationMinutes: 15,
      type: "SPRINT",
      taskPrompt: "One clean run. Name the target, then move. 15 minutes.",
    },
    deep_creative: {
      durationMinutes: 25,
      type: "DEEP_WORK",
      taskPrompt: "Take the next move from yesterday and complete it. 25 minutes.",
    },
    minimal_normal: {
      durationMinutes: 10,
      type: "LIGHT_FOCUS",
      taskPrompt: "Two days of clean blocks. Keep the rhythm. 10 minutes.",
    },
  },
  completionPayoff: {
    student: "Three study blocks. Evidence is forming.",
    game_like: "Three runs. Pattern is emerging.",
    deep_creative: "Three project sessions. Thread is holding.",
    minimal_normal: "Three clean blocks. Consistency is real.",
  },
  nextActionCopy: {
    student: "Tomorrow VEX will share something it learned about your study style.",
    game_like: "Tomorrow VEX will share something it learned about your runs.",
    deep_creative: "Tomorrow VEX will share something it learned about your project flow.",
    minimal_normal: "Tomorrow VEX will share something it learned about your rhythm.",
  },
  notificationCopy: {
    title: {
      student: "Three study blocks so far",
      game_like: "Three runs so far",
      deep_creative: "Three project sessions",
      minimal_normal: "Three clean blocks",
    },
    body: {
      student: "You have built real evidence. Return to keep it going.",
      game_like: "Pattern forming. Come back for another run.",
      deep_creative: "Project thread is holding. Come back to continue.",
      minimal_normal: "Consistency is real. Another block when ready.",
    },
  },
  premiumTrigger: { day: 2, trigger: "none", copyKey: "none" },
  returnReason: {
    student: "VEX knows what I need to study or review next.",
    game_like: "VEX helps me build momentum and understand what blocks me.",
    deep_creative: "VEX remembers where I left off.",
    minimal_normal: "VEX gives me one useful action without noise.",
  },
};
