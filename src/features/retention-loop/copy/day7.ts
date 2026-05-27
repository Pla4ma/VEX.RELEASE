import type { JourneyDayCopy } from "../schemas";

export const DAY7_COPY: JourneyDayCopy = {
  homeMessage: {
    student: "Your first weekly study intelligence is here.",
    game_like: "Your first weekly run intelligence is here.",
    deep_creative: "Your first weekly project intelligence is here.",
    minimal_normal: "Your first weekly intelligence is here.",
  },
  primaryCta: {
    student: "See your weekly study insight",
    game_like: "See your weekly run insight",
    deep_creative: "See your weekly project insight",
    minimal_normal: "See your weekly insight",
  },
  sessionSuggestion: {
    student: {
      durationMinutes: 25,
      type: "STUDY",
      taskPrompt: "Use the weekly insight to pick your best study window. 25 minutes.",
    },
    game_like: {
      durationMinutes: 20,
      type: "SPRINT",
      taskPrompt: "Use the weekly insight to pick your strongest encounter. 20 minutes.",
    },
    deep_creative: {
      durationMinutes: 30,
      type: "DEEP_WORK",
      taskPrompt: "Use the weekly insight to plan your next project move. 30 minutes.",
    },
    minimal_normal: {
      durationMinutes: 15,
      type: "LIGHT_FOCUS",
      taskPrompt: "Use the weekly insight to plan your best next block. 15 minutes.",
    },
  },
  completionPayoff: {
    student: "First week complete. VEX now has real evidence to guide your study.",
    game_like: "First week complete. VEX now has real evidence to guide your runs.",
    deep_creative: "First week complete. VEX now has real evidence to guide your projects.",
    minimal_normal: "First week complete. VEX now has real evidence to guide your rhythm.",
  },
  nextActionCopy: {
    student: "VEX will keep learning. Week 2 starts tomorrow.",
    game_like: "VEX will keep learning. Week 2 starts tomorrow.",
    deep_creative: "VEX will keep learning. Week 2 starts tomorrow.",
    minimal_normal: "VEX will keep learning. Week 2 starts tomorrow.",
  },
  notificationCopy: {
    title: {
      student: "Weekly study insight ready",
      game_like: "Weekly run insight ready",
      deep_creative: "Weekly project insight ready",
      minimal_normal: "Weekly insight ready",
    },
    body: {
      student: "See what helped your study, what got in the way, and what is next.",
      game_like: "See what helped your runs, what got in the way, and what is next.",
      deep_creative: "See what helped your project flow, what got in the way, and what is next.",
      minimal_normal: "See what helped your rhythm, what got in the way, and what is next.",
    },
  },
  premiumTrigger: { day: 7, trigger: "deep_insight_tap", copyKey: "study" },
  returnReason: {
    student: "One week of study data. VEX is smarter now. Return to keep building.",
    game_like: "One week of run data. VEX is smarter now. Return to keep improving.",
    deep_creative: "One week of project data. VEX is smarter now. Return to keep building.",
    minimal_normal: "One week of clean data. VEX is smarter now. Return to keep your rhythm.",
  },
};
