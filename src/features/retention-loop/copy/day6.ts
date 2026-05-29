import type { JourneyDayCopy } from "../schemas";

export const DAY6_COPY: JourneyDayCopy = {
  homeMessage: {
    student: "Almost a full week. VEX is preparing your study insight.",
    game_like: "Almost a full week. VEX is preparing your run insight.",
    deep_creative: "Almost a full week. VEX is preparing your project insight.",
    minimal_normal: "Almost a full week. VEX is preparing your insight.",
  },
  primaryCta: {
    student: "One more study block before the insight",
    game_like: "One more run before the insight",
    deep_creative: "One more project session before the insight",
    minimal_normal: "One more clean block before the insight",
  },
  sessionSuggestion: {
    student: {
      durationMinutes: 25,
      type: "STUDY",
      taskPrompt: "One more study block. Tomorrow VEX shows your full-week pattern.",
    },
    game_like: {
      durationMinutes: 20,
      type: "SPRINT",
      taskPrompt: "One more run. Tomorrow VEX shows your full-week pattern.",
    },
    deep_creative: {
      durationMinutes: 30,
      type: "DEEP_WORK",
      taskPrompt: "One more project session. Tomorrow VEX shows your full-week view.",
    },
    minimal_normal: {
      durationMinutes: 10,
      type: "LIGHT_FOCUS",
      taskPrompt: "One more clean block. Tomorrow VEX shows your full-week rhythm.",
    },
  },
  completionPayoff: {
    student: "Six study blocks. Weekly intelligence arrives tomorrow.",
    game_like: "Six runs. Weekly intelligence arrives tomorrow.",
    deep_creative: "Six project sessions. Weekly intelligence arrives tomorrow.",
    minimal_normal: "Six clean blocks. Weekly intelligence arrives tomorrow.",
  },
  nextActionCopy: {
    student: "Return tomorrow for your first weekly study intelligence moment.",
    game_like: "Return tomorrow for your first weekly run intelligence moment.",
    deep_creative: "Return tomorrow for your first weekly project intelligence moment.",
    minimal_normal: "Return tomorrow for your first weekly clean intelligence moment.",
  },
  notificationCopy: {
    title: {
      student: "Weekly study insight ready tomorrow",
      game_like: "Weekly run insight ready tomorrow",
      deep_creative: "Weekly project insight ready tomorrow",
      minimal_normal: "Weekly insight ready tomorrow",
    },
    body: {
      student: "One more block today locks in your full first-week picture.",
      game_like: "One more run today locks in your full first-week picture.",
      deep_creative: "One more session today locks in your full first-week picture.",
      minimal_normal: "One more block today locks in your full first-week picture.",
    },
  },
  premiumTrigger: { day: 6, trigger: "none", copyKey: "none" },
  returnReason: {
    student: "VEX knows what I need to study or review next.",
    game_like: "VEX helps me build momentum and understand what blocks me.",
    deep_creative: "VEX remembers where I left off.",
    minimal_normal: "VEX gives me one useful action without noise.",
  },
};
