import type { JourneyDayCopy } from "../schemas";

export const DAY5_COPY: JourneyDayCopy = {
  homeMessage: {
    student: "Your study lane is forming.",
    game_like: "Your run path is forming.",
    deep_creative: "Your project lane is forming.",
    minimal_normal: "Your clean pattern is forming.",
  },
  primaryCta: {
    student: "Continue your study path",
    game_like: "Continue your run path",
    deep_creative: "Continue your project path",
    minimal_normal: "Continue your clean path",
  },
  sessionSuggestion: {
    student: {
      durationMinutes: 25,
      type: "STUDY",
      taskPrompt: "You have a clear study pattern now. Follow it for 25 minutes.",
    },
    game_like: {
      durationMinutes: 20,
      type: "SPRINT",
      taskPrompt: "Your run style is emerging. Follow it for 20 minutes.",
    },
    deep_creative: {
      durationMinutes: 30,
      type: "DEEP_WORK",
      taskPrompt: "Your project flow has a shape now. Follow it for 30 minutes.",
    },
    minimal_normal: {
      durationMinutes: 15,
      type: "LIGHT_FOCUS",
      taskPrompt: "Your clean rhythm is forming. Follow it for 15 minutes.",
    },
  },
  completionPayoff: {
    student: "Fifth study block. You are building a real practice.",
    game_like: "Fifth run. Your movement discipline is real.",
    deep_creative: "Fifth project session. Your thread is deep now.",
    minimal_normal: "Fifth clean block. Your consistency is becoming a practice.",
  },
  nextActionCopy: {
    student: "Tomorrow VEX prepares a look at your full study week.",
    game_like: "Tomorrow VEX prepares a look at your full run week.",
    deep_creative: "Tomorrow VEX prepares a look at your full project week.",
    minimal_normal: "Tomorrow VEX prepares a look at your full week.",
  },
  notificationCopy: {
    title: {
      student: "Study lane forming",
      game_like: "Run path forming",
      deep_creative: "Project lane forming",
      minimal_normal: "Clean pattern forming",
    },
    body: {
      student: "Your study practice is taking shape. Keep going.",
      game_like: "Your run discipline has a shape. Keep it alive.",
      deep_creative: "Your project thread is clear. Keep it moving.",
      minimal_normal: "Your clean rhythm is solid. Keep it.",
    },
  },
  premiumTrigger: { day: 5, trigger: "none", copyKey: "none" },
  returnReason: {
    student: "Your study practice has a real shape now. Return to refine it.",
    game_like: "Your run discipline is clear. Return to sharpen it.",
    deep_creative: "Your project practice is defined. Return to deepen it.",
    minimal_normal: "Your clean practice is established. Return to reinforce it.",
  },
};
