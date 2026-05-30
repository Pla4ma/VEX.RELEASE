import {
  useBossEngagementSummaryForCoach,
  useBossEngagementSummary as useBossEngagementSummaryAlias,
} from "../hooks/useBossEngagementSummary";
import type { BossEngagementSummaryData } from "../hooks/useBossEngagementSummary";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { renderHook, waitFor } from "@testing-library/react-native";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children,
    );
  };
}

describe("hooks/useBossEngagementSummaryForCoach", () => {
  it("is disabled when userId is null", () => {
    const { result } = renderHook(
      () => useBossEngagementSummaryForCoach(null),
      { wrapper: createWrapper() },
    );
    expect(result.current.isFetching).toBe(false);
  });

  it("fetches and returns zeroed data when userId provided", async () => {
    const { result } = renderHook(
      () => useBossEngagementSummaryForCoach("user-1"),
      { wrapper: createWrapper() },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({
      bossRouteOpenedCount: 0,
      bossCTAClickedCount: 0,
      bossDamageEventsCount: 0,
      recentSessionsWithBossProgress: 0,
    });
  });

  it("useBossEngagementSummary is the same reference as useBossEngagementSummaryForCoach", () => {
    expect(useBossEngagementSummaryAlias).toBe(useBossEngagementSummaryForCoach);
  });

  it("BossEngagementSummaryData has all expected fields at 0", () => {
    const data: BossEngagementSummaryData = {
      bossRouteOpenedCount: 0,
      bossCTAClickedCount: 0,
      bossDamageEventsCount: 0,
      recentSessionsWithBossProgress: 0,
    };
    expect(Object.keys(data)).toHaveLength(4);
  });
});
