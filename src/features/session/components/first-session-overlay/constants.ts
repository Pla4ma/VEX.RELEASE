/**
 * First Session Overlay Constants
 */

import type { TooltipStep } from "./types";

export const TOOLTIPS: TooltipStep[] = [
  {
    target: "timer",
    title: "Your Session Engine",
    description:
      "Set your duration and tap Start. VEX adapts to how you work — not the other way around.",
    icon: "⏱️",
  },
  {
    target: "quality",
    title: "Session Reflection",
    description:
      "After your session, reflect on what helped or broke your focus. This builds your personal patterns over time.",
    icon: "⭐",
  },
];

export const HAS_SEEN_FIRST_SESSION_OVERLAY_KEY =
  "has_seen_first_session_overlay";
