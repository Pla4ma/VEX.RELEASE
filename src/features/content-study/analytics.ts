/**
 * Content Study Analytics — Barrel
 *
 * Re-exports all analytics sub-modules for backward compatibility.
 * Split into: service, input trackers, study trackers, and hooks.
 */

export {
  ContentStudyAnalyticsService,
  contentStudyAnalytics,
} from "./analytics-service";
export type { AnalyticsProvider } from "./analytics-service";

export { hashString } from "./analytics-input-trackers";

export { calculateMetrics, useContentStudyAnalytics } from "./analytics-hooks";

import { inputTrackers } from "./analytics-input-trackers";
import { studyTrackers } from "./analytics-study-trackers";

/** Combined convenience analytics event trackers */
export const analytics = {
  ...inputTrackers,
  ...studyTrackers,
};
