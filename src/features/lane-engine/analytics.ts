import { addBreadcrumb, captureException } from '../../config/sentry';
import type { LaneEvent } from './events';

export function trackLaneEvent(event: LaneEvent): void {
  try {
    addBreadcrumb('Lane event', 'lane-engine', {
      type: event.type,
      lane: event.type === 'lane_changed' ? event.nextProfile.primaryLane : event.profile.primaryLane,
    });
  } catch (error) {
    captureException(error instanceof Error ? error : new Error(String(error)), {
      feature: 'lane-engine',
      operation: 'trackLaneEvent',
    });
  }
}
