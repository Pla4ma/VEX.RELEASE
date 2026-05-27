import { addBreadcrumb } from "../../config/sentry";
import type { FocusProfile } from "./schemas";

export function trackFocusProfileUpdated(profile: FocusProfile): void {
  addBreadcrumb("Focus profile updated", "focus-profile", {
    userId: profile.userId,
    lane: profile.laneProfile.primaryLane,
  });
}
