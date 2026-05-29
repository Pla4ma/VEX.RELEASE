import type { JourneyDayCopy } from "../schemas";

export const DAY7_COPY: JourneyDayCopy = {
  homeMessage: {
    student:
      "This week, your strongest study rhythm was shorter named blocks.",
    game_like:
      "Your biggest blocker this week was opening the app without starting.",
    deep_creative:
      "Your project stayed active when you saved a handoff after each block.",
    minimal_normal:
      "Your cleanest sessions happened when VEX stayed quiet.",
  },
  primaryCta: {
    student: "See study intelligence",
    game_like: "See run intelligence",
    deep_creative: "See project continuity map",
    minimal_normal: "See your week pattern",
  },
  sessionSuggestion: {
    student: {
      durationMinutes: 25,
      type: "STUDY",
      taskPrompt: "Review the weakest topic VEX identified. Name it first, 25 minutes.",
    },
    game_like: {
      durationMinutes: 20,
      type: "SPRINT",
      taskPrompt: "Run with a named target. 20 minutes of clean focus.",
    },
    deep_creative: {
      durationMinutes: 30,
      type: "DEEP_WORK",
      taskPrompt: "Continue the longest project thread. Save a handoff note after, 30 minutes.",
    },
    minimal_normal: {
      durationMinutes: 15,
      type: "LIGHT_FOCUS",
      taskPrompt: "Start at the time window that worked best this week. 15 minutes.",
    },
  },
  completionPayoff: {
    student: "One week of study data. VEX knows your topic strengths and gaps.",
    game_like: "One week of run data. VEX knows your blocker patterns.",
    deep_creative: "One week of project data. VEX knows your thread patterns.",
    minimal_normal: "One week of clean data. VEX knows your rhythm windows.",
  },
  nextActionCopy: {
    student: "Week 2 starts tomorrow. VEX will suggest reviews based on your gaps.",
    game_like: "Week 2 starts tomorrow. VEX will match run style to your pattern.",
    deep_creative: "Week 2 starts tomorrow. VEX will surface your strongest thread.",
    minimal_normal: "Week 2 starts tomorrow. VEX will suggest your best time window.",
  },
  notificationCopy: {
    title: {
      student: "Your study intelligence is ready",
      game_like: "Your run intelligence is ready",
      deep_creative: "Your project continuity map is ready",
      minimal_normal: "Your week pattern is ready",
    },
    body: {
      student:
        "VEX found your strongest study rhythm. Shorter named blocks worked best.",
      game_like:
        "VEX found your biggest blocker. See how to overcome it.",
      deep_creative:
        "VEX found your thread patterns. Handoff notes made the difference.",
      minimal_normal:
        "VEX found your best sessions were the quietest. See the pattern.",
    },
  },
  premiumTrigger: { day: 7, trigger: "deep_insight_tap", copyKey: "none" },
  returnReason: {
    student: "VEX knows what I need to study or review next.",
    game_like: "VEX helps me build momentum and understand what blocks me.",
    deep_creative: "VEX remembers where I left off.",
    minimal_normal: "VEX gives me one useful action without noise.",
  },
};
