import { useQuery } from "@tanstack/react-query";
import { buildTodaySystem } from "./service";
import type { TodaySystemInput } from "./schemas";

const FALLBACK_INPUT: TodaySystemInput = {
  completedToday: 0,
  dayFeelsMessy: false,
  hiddenFeatureKeys: [],
  lane: "minimal_normal",
  laterAction: null,
  nowAction: null,
  reducedMotion: false,
};

export function useTodaySystem(input: TodaySystemInput | null) {
  const query = useQuery({
    queryKey: ["today-system", input],
    queryFn: () => buildTodaySystem(input ?? FALLBACK_INPUT),
    enabled: input !== null && !input.hiddenFeatureKeys.includes("today_strip"),
  });

  return {
    data: query.data ?? null,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
