import type { CompanionMemoryType } from "./memory-types";

export const COMPANION_MEMORY_COPY: Record<
  CompanionMemoryType,
  { body: string; title: string }
> = {
  boss_first_defeat: {
    body: "You finished the fight with focus instead of force. Your companion kept that proof.",
    title: "First Boss Defeat",
  },
  companion_first_evolution: {
    body: "Enough sessions stacked up to change your companion. Progress became visible.",
    title: "First Evolution",
  },
  companion_second_evolution: {
    body: "Your companion changed again because you kept returning to the work.",
    title: "Second Evolution",
  },
  contract_streak: {
    body: "Seven sessions in a row matched what you said you would do.",
    title: "Contract Chain",
  },
  first_30_day_streak: {
    body: "Thirty days of returns. This stopped being a burst and became part of your life.",
    title: "30 Days Straight",
  },
  first_7_day_streak: {
    body: "One week without breaking the chain. This is where habits actually form.",
    title: "7 Days Straight",
  },
  first_clean_sprint: {
    body: "A sprint with full purity. Short work can still be exact.",
    title: "Clean Sprint",
  },
  first_comeback: {
    body: "After missing days, you returned instead of quitting. That matters more than the streak number.",
    title: "You Came Back",
  },
  first_deep_work: {
    body: "Forty-five minutes held steady. Your companion marked the first long stretch.",
    title: "First Deep Work",
  },
  first_s_grade: {
    body: "Zero pauses. Clean finish. You showed yourself what full focus feels like.",
    title: "First Perfect Session",
  },
  first_session: {
    body: "You started and finished a real focus session. This is where your record begins.",
    title: "First Session",
  },
  hardest_comeback: {
    body: "The gap was longer than before, and you still came back to the work.",
    title: "Hardest Comeback",
  },
  milestone_custom: {
    body: "A specific milestone landed here because it changed your focus story.",
    title: "Focus Milestone",
  },
  personal_best_broken: {
    body: "You passed a record you had already set. Your ceiling moved.",
    title: "Record Broken",
  },
};
