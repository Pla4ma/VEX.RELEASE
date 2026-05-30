import type { SessionMode } from "../../session/modes";
import type { useActiveSessionController } from "./hooks/useActiveSessionController";
import type { useStudyQuizBreak } from "./hooks/useStudyQuizBreak";
import type { ActiveSessionDisplayPolicy } from "./utils/active-session-display-policy";
import type { ActiveSessionHeroViewModel } from "./utils/active-session-hero-view-model";
import type { FocusContract } from "../../features/focus-contract/types";
import type { Lane } from "../../features/lane-engine/types";

export const ENABLE_SESSION_COMPANION_LAYER = true;
export const ENABLE_SESSION_COACH_BANNER = true;
export const ENABLE_SESSION_MODE_OVERLAYS = true;
export const ENABLE_SESSION_HERO = true;

export interface ActiveSessionContentProps {
  controller: ReturnType<typeof useActiveSessionController>;
  contract: FocusContract | null;
  currentMode: SessionMode;
  lane: Lane;
  displayPolicy: ActiveSessionDisplayPolicy;
  heroViewModel: ActiveSessionHeroViewModel;
  outerStrokeDashoffset: number;
  focusStage: "interruption" | "paused" | "active";
  studyQuizBreak: ReturnType<typeof useStudyQuizBreak>;
  plannedQuizBreakOptedIn: boolean;
}
