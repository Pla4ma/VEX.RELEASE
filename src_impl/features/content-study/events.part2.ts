import type { ContentStudyEventMap } from "./types";
import { captureException } from "../../config/sentry";
import { useEffect, useCallback, useRef } from "react";


export function initializeContentStudyEventIntegration(appEventBus?: { subscribe: (event: string, callback: (data: unknown) => void) => () => void; emit: (event: string, data: unknown) => void }): void {
  if (!appEventBus) {
    return;
  }

  // Forward content study events to main event bus
  const eventsToForward: Array<keyof ContentStudyEventMap> = ['content-study:session-started', 'content-study:session-ended', 'content-study:content-deleted'];

  eventsToForward.forEach((event) => {
    contentStudyEvents.subscribe(event, (data) => {
      appEventBus.emit(event as string, data);
    });
  });
}