import type { JourneyDayCopy } from "../schemas";

export const DAY3_COPY: JourneyDayCopy = {
  homeMessage: {
    student: "Your best study blocks share a pattern. VEX found it.",
    game_like: "Your cleanest runs have something in common. VEX sees it.",
    deep_creative: "Your project has a thread shape now. VEX can see the path.",
    minimal_normal: "Your clean rhythm has a shape. VEX found the pattern.",
  },
  primaryCta: {
    student: "See your study pattern",
    game_like: "See your run pattern",
    deep_creative: "See your project path",
    minimal_normal: "See your rhythm",
  },
  sessionSuggestion: {
    student: {
      durationMinutes: 20,
      type: "STUDY",
      taskPrompt: "Study the topic VEX flagged as weakest. 20 minutes on that.",
    },
    game_like: {
      durationMinutes: 15,
      type: "SPRINT",
      taskPrompt: "Run the encounter type that felt cleanest last time. 15 minutes.",
    },
    deep_creative: {
      durationMinutes: 25,
      type: "DEEP_WORK",
      taskPrompt: "Continue the project move you saved. 25 minutes of protected time.",
    },
    minimal_normal: {
      durationMinutes: 10,
      type: "LIGHT_FOCUS",
      taskPrompt: "Same time of day as your best block. 10 minutes.",
    },
  },
  completionPayoff: {
    student: "Three study blocks. VEX now knows which topics need more time.",
    game_like: "Three runs. VEX now knows which encounter style works best for you.",
    deep_creative: "Three project sessions. VEX now knows your next-move pattern.",
    minimal_normal: "Three clean blocks. VEX now knows your best time window.",
  },
  nextActionCopy: {
    student: "Tomorrow VEX will suggest a review based on what you studied today.",
    game_like: "Tomorrow VEX will adjust the run difficulty based on today's encounter.",
    deep_creative: "Tomorrow VEX will surface the next move from today's handoff.",
    minimal_normal: "Tomorrow VEX will suggest the same time window that worked today.",
  },
  notificationCopy: {
    title: {
      student: "VEX found your study pattern",
      game_like: "VEX found your run pattern",
      deep_creative: "VEX found your project shape",
      minimal_normal: "VEX found your rhythm shape",
    },
    body: {
      student: "Your best study time and topic style — VEX is ready to use it.",
      game_like: "Your cleanest encounter type — VEX is ready to suggest it.",
      deep_creative: "Your project thread has a shape now. VEX can guide the next move.",
      minimal_normal: "Your best time window — VEX is ready to suggest it.",
    },
  },
  premiumTrigger: { day: 3, trigger: "none", copyKey: "none" },
  returnReason: {
    student: "VEX knows your study rhythm now. Return to use what it learned.",
    game_like: "VEX knows your encounter style now. Return to sharpen it.",
    deep_creative: "VEX knows your project shape now. Return to keep building.",
    minimal_normal: "VEX knows your clean rhythm now. Return to reinforce it.",
  },
};
