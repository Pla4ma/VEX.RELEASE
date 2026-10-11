import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react-native';
import * as sessionHistoryRepository from '../../session-history/repository';
import { canShowMemoryConsole } from '../service';
import { useMemoryConsoleVisibility } from '../useMemoryConsoleVisibility';

jest.mock('../../session-history/repository');

const historyRepository = jest.mocked(sessionHistoryRepository);

function createWrapper(): React.ComponentType<{ children: React.ReactNode }> {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { gcTime: 0 },
    },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children,
    );
  };
}

describe('memory console visibility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('keeps the console hidden until three sessions are completed', async () => {
    historyRepository.countCompletedSessions.mockResolvedValue(2);
    await expect(canShowMemoryConsole('user-1')).resolves.toBe(false);

    historyRepository.countCompletedSessions.mockResolvedValue(3);
    await expect(canShowMemoryConsole('user-1')).resolves.toBe(true);
  });

  it('does not query history when there is no user', async () => {
    await expect(canShowMemoryConsole(null)).resolves.toBe(false);
    expect(historyRepository.countCompletedSessions).not.toHaveBeenCalled();
  });

  it('does not show an endless loading state without a user', async () => {
    const { result } = await renderHook(
      () => useMemoryConsoleVisibility(null),
      { wrapper: createWrapper() },
    );
    expect(result.current).toEqual({
      isVisible: false,
      isLoading: false,
      error: null,
    });
  });
});
