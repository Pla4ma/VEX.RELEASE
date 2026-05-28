import type { CoreAnalyticsEventDefinitions } from "./analytics-core";
import type { ExtendedAnalyticsEventDefinitions } from "./analytics-extended";

export interface AnalyticsEventDefinitions
  extends CoreAnalyticsEventDefinitions,
    ExtendedAnalyticsEventDefinitions {}

export type { CoreAnalyticsEventDefinitions } from "./analytics-core";
export type { ExtendedAnalyticsEventDefinitions } from "./analytics-extended";
