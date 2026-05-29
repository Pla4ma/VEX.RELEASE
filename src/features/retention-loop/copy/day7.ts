import type { JourneyDayCopy } from "../schemas";

export const DAY7_COPY: JourneyDayCopy = {
  homeMessage: {
    student: "Your study data turned into real intelligence. See what VEX found.",
    game_like: "Your runs reveal a clear pattern. VEX mapped your focus style.",
    deep_creative: "Your project sessions have a shape. VEX found the thread.",
    minimal_normal: "Your week of clean blocks shows a clear pattern. See it.",
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
      taskPrompt: "Review the weakest topic VEX identified. 25 minutes of targeted study.",
    },
    game_like: {
      durationMinutes: 20,
      type: "SPRINT",
      taskPrompt: "Run the encounter style that scored highest this week. 20 minutes.",
    },
    deep_creative: {
      durationMinutes: 30,
      type: "DEEP_WORK",
      taskPrompt: "Continue the longest project thread. 30 minutes of deep work.",
    },
    minimal_normal: {
      durationMinutes: 15,
      type: "LIGHT_FOCUS",
      taskPrompt: "Start at the time window that worked best this week. 15 minutes.",
    },
  },
  completionPayoff: {
    student: "One week of study data. VEX now knows your topic strengths and gaps.",
    game_like: "One week of run data. VEX now knows your encounter style and blockers.",
    deep_creative: "One week of project data. VEX now knows your thread patterns.",
    minimal_normal: "One week of clean data. VEX now knows your rhythm windows.",
  },
  nextActionCopy: {
    student: "Week 2 starts tomorrow. VEX will suggest reviews based on your gaps.",
    game_like: "Week 2 starts tomorrow. VEX will match encounter difficulty to your level.",
    deep_creative: "Week 2 starts tomorrow. VEX will surface your strongest thread.",
    minimal_normal: "Week 2 starts tomorrow. VEX will suggest your best time window.",
  },
  notificationCopy: {
    title: {
      student: "Study intelligence ready",
      game_like: "Run intelligence ready",
      deep_creative: "Project continuity map ready",
      minimal_normal: "Week pattern ready",
    },
    body: {
      student: "VEX found your topic gaps and study strengths. See the full picture.",
      game_like: "VEX found your best encounter style and blocker patterns. See the map.",
      deep_creative: "VEX found your thread shape and next-move patterns. See the path.",
      minimal_normal: "VEX found your best time windows and rhythm. See the pattern.",
    },
  },
  premiumTrigger: { day: 7, trigger: "deep_insight_tap", copyKey: "study" },
  returnReason: {
    student: "One week of study evidence. VEX knows your gaps. Return to close them.",
    game_like: "One week of run evidence. VEX knows your style. Return to sharpen it.",
    deep_creative: "One week of project evidence. VEX knows your threads. Return to build.",
    minimal_normal: "One week of clean evidence. VEX knows your rhythm. Return to keep it.",
  },
};
