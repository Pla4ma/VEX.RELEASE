import type { Lane } from "../lane-engine/types";
import type {
  ModeRescueCopy,
  ModeNotificationCopy,
  ModePremiumBridge,
} from "./schemas";

// ── Mode-specific return hooks ──────────────────────────────────────────
// These are the one-line answers to "Why come back tomorrow?" per mode

export const MODE_RETURN_HOOK: Record<Lane, string> = {
  student: "Your next study block is ready.",
  game_like: "Your next clean run is ready.",
  deep_creative: "Your project is waiting at the next move.",
  minimal_normal: "One clean action is ready.",
};

export const MODE_RETURN_REASON: Record<Lane, string> = {
  student: "VEX knows what I need to study or review next.",
  game_like: "VEX helps me build momentum and understand what blocks me.",
  deep_creative: "VEX remembers where I left off.",
  minimal_normal: "VEX gives me one useful action without noise.",
};

// ── Mode-specific day copy ──────────────────────────────────────────────

export const MODE_DAY1_COPY: Record<Lane, string> = {
  student: "Continue with one review block.",
  game_like: "Start one clean run before friction stacks.",
  deep_creative: "Continue from the next move you saved.",
  minimal_normal: "One clean block is enough today.",
};

export const MODE_DAY3_MEMORY: Record<Lane, string> = {
  student:
    "VEX noticed your study blocks work better when the target is named first.",
  game_like: "VEX noticed your strongest runs start with a named target.",
  deep_creative:
    "VEX noticed your project thread gets easier to resume when the next move is specific.",
  minimal_normal:
    "VEX noticed you prefer fewer prompts and one clear action.",
};

export const MODE_DAY7_INTELLIGENCE: Record<Lane, string> = {
  student:
    "This week, your strongest study rhythm was shorter named blocks.",
  game_like:
    "Your biggest blocker this week was opening the app without starting.",
  deep_creative:
    "Your project stayed active when you saved a handoff after each block.",
  minimal_normal:
    "Your cleanest sessions happened when VEX stayed quiet.",
};

// ── Mode-specific rescue copy ───────────────────────────────────────────

export const MODE_RESCUE_COPY: Record<Lane, ModeRescueCopy> = {
  student: {
    lane: "student",
    headline: "Review one weak section for 8 minutes",
    body: "Just open your notes. One section. No quiz, no pressure. VEX will suggest what to review next.",
    sessionMinutes: 8,
    actionLabel: "Start review",
  },
  game_like: {
    lane: "game_like",
    headline: "Recovery run: 10 clean minutes",
    body: "No blockers. No targets. Just 10 minutes of clean focus. Momentum resets after.",
    sessionMinutes: 10,
    actionLabel: "Start recovery",
  },
  deep_creative: {
    lane: "deep_creative",
    headline: "Re-enter the project and find the next move",
    body: "Just open the project. Find one next move. That's all. VEX saves the thread.",
    sessionMinutes: 7,
    actionLabel: "Re-enter",
  },
  minimal_normal: {
    lane: "minimal_normal",
    headline: "Do 5 minutes. Stop cleanly.",
    body: "One action. Five minutes. That's a win. VEX won't ask for more.",
    sessionMinutes: 5,
    actionLabel: "Start",
  },
};

// ── Mode-specific notification copy ─────────────────────────────────────

export const MODE_NOTIFICATION_COPY: Record<Lane, ModeNotificationCopy> = {
  student: {
    lane: "student",
    title: "Your next review block is small",
    body: "10 minutes. One topic VEX flagged for review.",
    maxPerDay: 1,
  },
  game_like: {
    lane: "game_like",
    title: "Your next clean run is ready",
    body: "15 minutes. Name the target and start.",
    maxPerDay: 1,
  },
  deep_creative: {
    lane: "deep_creative",
    title: "Your project thread is waiting at the next move",
    body: "One concrete step. Ready when you are.",
    maxPerDay: 1,
  },
  minimal_normal: {
    lane: "minimal_normal",
    title: "One clean block is enough today",
    body: "15 minutes. One action. Done.",
    maxPerDay: 1,
  },
};

// ── Mode-specific premium bridges ───────────────────────────────────────

export const MODE_PREMIUM_BRIDGE: Record<Lane, ModePremiumBridge> = {
  student: {
    lane: "student",
    headline: "Go deeper with Study Intelligence",
    featureList:
      "weak topics, review planning, and exam prep.",
    triggerDay: 7,
  },
  game_like: {
    lane: "game_like",
    headline: "Unlock advanced Run Intelligence",
    featureList:
      "blocker patterns, custom modifiers, and weekly run recaps.",
    triggerDay: 7,
  },
  deep_creative: {
    lane: "deep_creative",
    headline: "Unlock Project Memory",
    featureList: "context restore, next moves, and flow windows.",
    triggerDay: 7,
  },
  minimal_normal: {
    lane: "minimal_normal",
    headline: "Unlock Focus Intelligence",
    featureList:
      "quiet weekly reports, best windows, and smarter planning.",
    triggerDay: 7,
  },
};

export { MODE_RETENTION_MANIFEST } from "./copy-manifest";
