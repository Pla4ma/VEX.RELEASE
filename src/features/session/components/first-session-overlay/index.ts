/**
 * First Session Overlay Module
 */

export { HighlightRing } from "./HighlightRing";
export { TooltipCard } from "./TooltipCard";
export { useFirstSessionOverlay } from "./useFirstSessionOverlay";
export { TOOLTIPS, HAS_SEEN_FIRST_SESSION_OVERLAY_KEY } from "./constants";
export type {
  TooltipStep,
  TooltipTarget,
  TooltipCardProps,
  HighlightRingProps,
  FirstSessionOverlayProps,
  UseFirstSessionOverlayResult,
} from "./types";

// Re-export main component as default
export { FirstSessionOverlay as default } from "./FirstSessionOverlay";
