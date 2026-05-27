/**
 * useSessionAnalytics Hook
 *
 * Analytics tracking helper for session events.
 */

import { useCallback } from "react";
import { capture } from "../../../shared/analytics/analytics-service";
import { createDebugger } from "../../../utils/debug";

const debug = createDebugger("session:analytics");

export function useSessionAnalytics() {
  const trackSessionEvent = useCallback(
    (event: string, data?: Record<string, unknown>) => {
      capture(`session_${event}`, data);
      debug.info("Session event tracked: %s", event, data);
    },
    [],
  );

  return { trackSessionEvent };
}
