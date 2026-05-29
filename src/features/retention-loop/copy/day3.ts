import type { JourneyDayCopy } from "../schemas";

export const DAY3_COPY: JourneyDayCopy = {
  homeMessage: {
    student:
      "VEX noticed your study blocks work better when the target is named first.",
    game_like: "VEX noticed your strongest runs start with a named target.",
    deep_creative:
      "VEX noticed your project thread gets easier to resume when the next move is specific.",
    minimal_normal:
      "VEX noticed you prefer fewer prompts and one clear action.",
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
      taskPrompt: "Study the topic VEX flagged as weakest. Name it first, 20 minutes.",
    },
    game_like: {
      durationMinutes: 15,
      type: "SPRINT",
      taskPrompt: "Run the style that felt cleanest last time. Name the target, 15 minutes.",
    },
    deep_creative: {
      durationMinutes: 25,
      type: "DEEP_WORK",
      taskPrompt: "Continue the project move you saved. Be specific about the next move, 25 minutes.",
    },
    minimal_normal: {
      durationMinutes: 10,
      type: "LIGHT_FOCUS",
      taskPrompt: "One clear action at your best time window. 10 minutes.",
    },
  },
  completionPayoff: {
    student: "Three study blocks. VEX now knows which topics need more time.",
    game_like: "Three runs. VEX now knows your strongest run pattern.",
    deep_creative: "Three project sessions. VEX now knows your thread shape.",
    minimal_normal: "Three clean blocks. VEX now knows your best time window.",
  },
  nextActionCopy: {
    student: "Tomorrow VEX will suggest a review based on what you studied today",
    game_like: "Tomorrow VEX will suggest a clean run based on today's pattern",
    deep_creative: "Tomorrow VEX will surface the next move from today's handoff",
    minimal_normal: "Tomorrow VEX will suggest the same time window that worked today",
  },
  notificationCopy: {
    title: {
      student: "VEX found your study pattern",
      game_like: "VEX found your run pattern",
      deep_creative: "VEX found your project shape",
      minimal_normal: "VEX found your rhythm shape",
    },
    body: {
      student:
        "Your study blocks work better when the target is named first. See what VEX learned.",
      game_like:
        "Your strongest runs start with a named target. See the pattern.",
      deep_creative:
        "Your project thread is clear when the next move is specific. See the path.",
      minimal_normal:
        "You prefer fewer prompts and one clear action. See the pattern.",
    },
  },
  premiumTrigger: { day: 3, trigger: "none", copyKey: "none" },
  returnReason: {
    student: "VEX knows what I need to study or review next.",
    game_like: "VEX helps me build momentum and understand what blocks me.",
    deep_creative: "VEX remembers where I left off.",
    minimal_normal: "VEX gives me one useful action without noise.",
  },
};
