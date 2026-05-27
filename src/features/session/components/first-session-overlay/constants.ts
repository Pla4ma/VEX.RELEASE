/**
 * First Session Overlay Constants
 */

import type { TooltipStep } from "./types";

export const TOOLTIPS: TooltipStep[] = [
  {
    target: "timer",
    title: "Focus Timer",
    description:
      "This is your focus timer. Set your desired focus duration and tap Start to begin your session.",
    icon: "⏱️",
  },
  {
    target: "quality",
    title: "Session Quality",
    description:
      "After each session, rate your focus quality. This helps track your progress over time.",
    icon: "⭐",
  },
  {
    target: "boss",
    title: "Boss Battle",
    description:
      "Complete focus sessions to defeat bosses and earn rewards! The more you focus, the stronger you become.",
    icon: "👹",
  },
];

export const HAS_SEEN_FIRST_SESSION_OVERLAY_KEY =
  "has_seen_first_session_overlay";
