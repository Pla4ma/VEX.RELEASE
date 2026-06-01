/**
 * Tests for boss hooks
 * Covers: useActiveBoss, useBossEngagementSummary, useAvailableBosses,
 *         useBossTemplates, hooks/useBossEngagementSummary exports
 */

import {
  useActiveBoss,
  useBossEngagementSummary,
  useAvailableBosses,
  useBossTemplates,
} from '../hooks/index';
import {
  useBossEngagementSummaryForCoach,
  useBossEngagementSummary as useBossEngagementSummaryAlias,
} from '../hooks/useBossEngagementSummary';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';

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

describe('useActiveBoss', () => {
  it('returns null data (archived)', async () => {
    const { result } = renderHook(() => useActiveBoss(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });
});

describe('useBossEngagementSummary', () => {
  it('returns zeroed engagement data', async () => {
    const { result } = renderHook(() => useBossEngagementSummary(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({
      bossRouteOpenedCount: 0,
      bossCTAClickedCount: 0,
      bossDamageEventsCount: 0,
      recentSessionsWithBossProgress: 0,
    });
  });
});

describe('useAvailableBosses', () => {
  it('returns empty array', async () => {
    const { result } = renderHook(() => useAvailableBosses(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });
});

describe('useBossTemplates', () => {
  it('returns empty array', async () => {
    const { result } = renderHook(() => useBossTemplates(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });
});

describe('hooks/useBossEngagementSummary', () => {
  it('useBossEngagementSummaryForCoach is disabled when userId is null', async () => {
    const { result } = renderHook(
      () => useBossEngagementSummaryForCoach(null),
      { wrapper: createWrapper() },
    );
    // Should not be fetching since userId is null
    expect(result.current.isFetching).toBe(false);
  });

  it('useBossEngagementSummaryForCoach fetches when userId provided', async () => {
    const { result } = renderHook(
      () => useBossEngagementSummaryForCoach('user-1'),
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

  it('useBossEngagementSummary is an alias', () => {
    expect(useBossEngagementSummaryAlias).toBe(useBossEngagementSummaryForCoach);
  });
});
