import type { JourneyDayCopy } from "../schemas";

export const DAY3_COPY: JourneyDayCopy = {
  homeMessage: {
    student: "VEX learned something about how you study.",
    game_like: "VEX learned something about how you run.",
    deep_creative: "VEX learned something about your project flow.",
    minimal_normal: "VEX learned something about your rhythm.",
  },
  primaryCta: {
    student: "See what VEX learned",
    game_like: "See what VEX learned",
    deep_creative: "See what VEX learned",
    minimal_normal: "See what VEX learned",
  },
  sessionSuggestion: {
    student: {
      durationMinutes: 20,
      type: "STUDY",
      taskPrompt: "Apply what VEX noticed. Study the way that works best.",
    },
    game_like: {
      durationMinutes: 15,
      type: "SPRINT",
      taskPrompt: "Run the way that feels cleanest. VEX noticed the pattern.",
    },
    deep_creative: {
      durationMinutes: 25,
      type: "DEEP_WORK",
      taskPrompt: "Use the project insight VEX noticed. Do the next move.",
    },
    minimal_normal: {
      durationMinutes: 10,
      type: "LIGHT_FOCUS",
      taskPrompt: "Keep the rhythm VEX noticed. One clean block.",
    },
  },
  completionPayoff: {
    student: "You now know what works. VEX will keep learning.",
    game_like: "You now know your run pattern. VEX will keep learning.",
    deep_creative: "You now know your project pattern. VEX will keep learning.",
    minimal_normal: "You now know your rhythm. VEX will keep learning.",
  },
  nextActionCopy: {
    student: "VEX is learning. Tomorrow it adapts based on your rhythm.",
    game_like: "VEX is adapting. Tomorrow it adjusts to your run pattern.",
    deep_creative: "VEX is adapting. Tomorrow it adjusts to your project flow.",
    minimal_normal: "VEX is adapting. Tomorrow it adjusts to your pace.",
  },
  notificationCopy: {
    title: {
      student: "VEX noticed a study pattern",
      game_like: "VEX noticed a run pattern",
      deep_creative: "VEX noticed a flow pattern",
      minimal_normal: "VEX noticed your rhythm",
    },
    body: {
      student: "A small insight about how you study is waiting. Tap to see.",
      game_like: "A small insight about your runs is waiting. Tap to see.",
      deep_creative: "A small insight about your project flow is waiting. Tap to see.",
      minimal_normal: "A small insight about your rhythm is waiting. Tap to see.",
    },
  },
  premiumTrigger: { day: 3, trigger: "none", copyKey: "none" },
  returnReason: {
    student: "VEX now knows something real about how you study. Return to refine.",
    game_like: "VEX now knows something real about your runs. Return to sharpen.",
    deep_creative: "VEX now knows something real about your project flow. Return to deepen.",
    minimal_normal: "VEX now knows something real about your rhythm. Return to reinforce.",
  },
};
