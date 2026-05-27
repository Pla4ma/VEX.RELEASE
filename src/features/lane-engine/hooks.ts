import { useMemo } from "react";

import { resolveBehaviorLane, resolveInitialLane } from "./service";
import type {
  LaneProfile,
  ResolveBehaviorLaneInput,
  ResolveInitialLaneInput,
} from "./types";

export function useInitialLane(input: ResolveInitialLaneInput): LaneProfile {
  return useMemo(() => resolveInitialLane(input), [input]);
}

export function useBehaviorLane(input: ResolveBehaviorLaneInput): LaneProfile {
  return useMemo(() => resolveBehaviorLane(input), [input]);
}
