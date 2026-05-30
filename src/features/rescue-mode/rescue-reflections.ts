import type { Lane } from "../lane-engine/types";
import type { RescuePlan, RescueReason } from "./schemas";

const RESCUE_REFLECTION_QUESTIONS: Record<Lane, Record<RescueReason, string>> = {
  student: {
    too_big: "Was the original task too big, or just the moment?",
    tired: "Would a different time of day help?",
    distracted: "What pulled your attention away first?",
    anxious: "What made starting feel heavy?",
    unclear: "What would make the next step clearer?",
    no_time: "Could 5 minutes work tomorrow?",
  },
  game_like: {
    too_big: "Was the run too long, or did you need a warm-up?",
    tired: "Would a different time fit better?",
    distracted: "What interrupted the run?",
    anxious: "What made the run feel heavy?",
    unclear: "What would make the next run clear?",
    no_time: "Could a 5-minute run fit tomorrow?",
  },
  deep_creative: {
    too_big: "Was the task too big, or did you need a smaller entry point?",
    tired: "Would a different time or environment help?",
    distracted: "What pulled you out of flow?",
    anxious: "What made re-entry feel difficult?",
    unclear: "What is the smallest concrete next step?",
    no_time: "Could 7 minutes work tomorrow?",
  },
  minimal_normal: {
    too_big: "Would a smaller block feel doable?",
    tired: "Would a different time of day help?",
    distracted: "What got in the way?",
    anxious: "What made starting feel hard?",
    unclear: "What would make the next step clear?",
    no_time: "Could 5 minutes work tomorrow?",
  },
};

export function getRescueReflectionQuestion(plan: RescuePlan): string {
  return RESCUE_REFLECTION_QUESTIONS[plan.lane][plan.reason];
}

const RETURN_TOMORROW_ACTIONS: Record<Lane, Record<RescueReason, string>> = {
  student: {
    too_big: "Break the next session into one review block.",
    tired: "Try again tomorrow when energy is higher.",
    distracted: "Clear distractions before starting tomorrow.",
    anxious: "Start with just one page. No quiz.",
    unclear: "Name one specific topic for tomorrow.",
    no_time: "Block 5 minutes tomorrow for one review.",
  },
  game_like: {
    too_big: "Start tomorrow with one short run.",
    tired: "Come back tomorrow when the run feels lighter.",
    distracted: "Silence everything before tomorrow's run.",
    anxious: "Tomorrow's run: 5 minutes of clean focus. That is enough.",
    unclear: "Pick one clear target for tomorrow.",
    no_time: "5-minute run tomorrow. No setup.",
  },
  deep_creative: {
    too_big: "Tomorrow: identify one concrete next move.",
    tired: "Return tomorrow with fresh eyes.",
    distracted: "Close everything except one file tomorrow.",
    anxious: "Tomorrow: just open the project. That is the session.",
    unclear: "Name the next step before tomorrow.",
    no_time: "7 minutes tomorrow. Just name the next move.",
  },
  minimal_normal: {
    too_big: "Start tomorrow with one 5-minute block.",
    tired: "Come back fresh tomorrow.",
    distracted: "Create a quiet space for tomorrow's block.",
    anxious: "Tomorrow: one block. No pressure beyond that.",
    unclear: "Define one small goal for tomorrow.",
    no_time: "5 minutes tomorrow. Just start.",
  },
};

export function getRescueReturnTomorrowAction(plan: RescuePlan): string {
  return RETURN_TOMORROW_ACTIONS[plan.lane][plan.reason];
}
