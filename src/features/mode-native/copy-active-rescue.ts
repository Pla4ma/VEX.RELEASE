import type { Lane } from "../lane-engine/types";
import type { ModeActiveIndicator, ModeRescueSurface } from "./schemas";

// ── Active session indicator copy (no claims, safe for all states) ──────

export const ACTIVE_INDICATOR_COPY: Record<
  Lane,
  Omit<ModeActiveIndicator, "lane">
> = {
  student: {
    targetLabel: "Studying",
    topLine: "Stay focused on the material",
    showProgressBar: true,
    showCompanion: false,
    allowNotes: true,
    density: "medium",
    quiet: true,
  },
  game_like: {
    targetLabel: "Momentum",
    topLine: "Clean start — keep moving forward",
    showProgressBar: true,
    showCompanion: false,
    allowNotes: false,
    density: "medium",
    quiet: true,
  },
  deep_creative: {
    targetLabel: "Protecting",
    topLine: "Next move in progress — thread protected",
    showProgressBar: true,
    showCompanion: false,
    allowNotes: true,
    density: "medium",
    quiet: true,
  },
  minimal_normal: {
    targetLabel: "One action",
    topLine: "In progress",
    showProgressBar: true,
    showCompanion: false,
    allowNotes: false,
    density: "low",
    quiet: true,
  },
};

// ── Rescue surface copy (no evidence claims — all safe) ─────────────────

export const RESCUE_COPY: Record<Lane, Omit<ModeRescueSurface, "lane">> = {
  student: {
    headline: "Review one section for 8 minutes",
    body: "Just open your notes. One section. No quiz, no pressure.",
    suggestedDurationMinutes: 8,
    actionLabel: "Start review",
  },
  game_like: {
    headline: "Recovery run: 10 clean minutes",
    body: "No blockers. No targets. Just 10 minutes of clean focus. Momentum resets after.",
    suggestedDurationMinutes: 10,
    actionLabel: "Start recovery run",
  },
  deep_creative: {
    headline: "Re-enter the project and find the next move",
    body: "Just open the project. Find one next move. That's all. VEX saves the thread.",
    suggestedDurationMinutes: 7,
    actionLabel: "Re-enter project",
  },
  minimal_normal: {
    headline: "Do 5 minutes. Stop cleanly.",
    body: "One action. Five minutes. That's a win. VEX won't ask for more.",
    suggestedDurationMinutes: 5,
    actionLabel: "Start",
  },
};
