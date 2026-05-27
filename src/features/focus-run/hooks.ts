import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { getStoredFocusRun } from "./repository";
import {
  buildFocusRunDisplay,
  computeFocusRunGrade,
  startFocusRun,
} from "./service";
import type { FocusRunDisplay, FocusRunGrade } from "./schemas";
import type { Lane } from "../lane-engine/types";

export function useFocusRun(userId: string | null, enabled = true) {
  const query = useQuery({
    enabled: Boolean(userId) && enabled,
    queryFn: () => getStoredFocusRun(userId ?? ""),
    queryKey: ["focus-run", userId],
  });

  return {
    data: query.data ?? null,
    error: query.error,
    isError: query.isError,
    isPending: query.isPending,
    refetch: query.refetch,
  };
}

export function useFocusRunDisplay(input: {
  lane: Lane;
  userId: string | null;
  signals?: string[];
  firstActiveDay?: number;
  enabled?: boolean;
}): FocusRunDisplay {
  const { data: run } = useFocusRun(input.userId, input.enabled);

  return useMemo(
    () =>
      buildFocusRunDisplay({
        firstActiveDay: input.firstActiveDay,
        lane: input.lane,
        run,
        signals: input.signals,
      }),
    [input.lane, input.userId, run, input.signals, input.firstActiveDay],
  );
}

export function useFocusRunGrade(
  userId: string | null,
  enabled = true,
): FocusRunGrade | null {
  const { data: run } = useFocusRun(userId, enabled);

  return useMemo(() => (run ? computeFocusRunGrade(run) : null), [run]);
}

export { startFocusRun };
