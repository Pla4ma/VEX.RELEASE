import { renderHook, act, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

jest.mock('../../../store', () => ({
  useAuthStore: () => ({
    user: { id: 'test-user-id', email: 'test@example.com' },
  }),
}));

jest.mock('../../../shared/ui/components/Toast', () => {
  const _ReactRuntime = require('react');
  return {
    __esModule: true,
    ToastProvider: ({ children }: { children: React.ReactNode }) => children,
    useToast: () => ({
      show: jest.fn(),
      dismiss: jest.fn(),
      dismissAll: jest.fn(),
      update: jest.fn(),
      toasts: [],
    }),
  };
});

jest.mock('../ContentStudyService', () => ({
  __esModule: true,
  submitContent: jest.fn(),
  extractContent: jest.fn(),
  generateStudyPlan: jest.fn(),
  getContentStatus: jest.fn(),
  uploadStudyFile: jest.fn(),
  updateContentText: jest.fn(),
  fetchContentById: jest.fn(),
  fetchGenerationById: jest.fn(),
  pollContentStatus: jest.fn(),
  fetchContentHistory: jest.fn(),
  deleteContent: jest.fn(),
}));

import * as service from '../ContentStudyService';
import { useContentHistory, useRateLimit } from '../hooks';
import { contentStudyQueryKeys } from '../hooks/queryKeys';
import { StudyContentSchema } from '../types';

const createWrapper = (queryClient: QueryClient) => {
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
  return wrapper;
};

const ToastProvider = ({ children }: { children: React.ReactNode }) => children;

describe('useContentHistory', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
        mutations: { gcTime: 0 },
      },
    });
    jest.clearAllMocks();
  });

  it('should fetch content history', async () => {
    const mockHistory = [
      { id: 'content-1', source_type: 'PASTE' },
      { id: 'content-2', source_type: 'YOUTUBE' },
    ];
    queryClient.setQueryData(
      contentStudyQueryKeys.history('test-user-id'),
      { pages: [mockHistory], pageParams: [0] },
    );
    const baseWrapper = createWrapper(queryClient);
    const wrapper = ({ children }: { children: React.ReactNode }) => 
      React.createElement(ToastProvider, null, baseWrapper({ children }));
    const { result } = await renderHook(() => useContentHistory(), { wrapper });
    await waitFor(
      () => {
        expect(result.current.content).toEqual(mockHistory);
      },
      { timeout: 3000 },
    );
  });

  it('loads older pages when the user reaches the end of the current history', async () => {
    const createItem = (id: string) => StudyContentSchema.parse({
      id,
      userId: 'test-user-id',
      sourceType: 'PASTE',
      extractedText: '',
      extractedLength: 0,
      language: 'en',
      isUserEdited: false,
      status: 'READY',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      generationCount: 0,
    });
    const firstPage = Array.from({ length: 20 }, (_, index) => createItem(`content-${index}`));
    const olderItem = createItem('older-content');
    jest.mocked(service.fetchContentHistory)
      .mockResolvedValueOnce(firstPage)
      .mockResolvedValueOnce([olderItem]);
    const baseWrapper = createWrapper(queryClient);
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(ToastProvider, null, baseWrapper({ children }));
    const { result } = await renderHook(() => useContentHistory(), { wrapper });
    await waitFor(() => expect(result.current.content).toHaveLength(20));

    await act(async () => { await result.current.fetchNextPage(); });

    await waitFor(() => expect(result.current.content).toHaveLength(21));
    expect(result.current.content[20]?.id).toBe('older-content');
    expect(service.fetchContentHistory).toHaveBeenNthCalledWith(1, 'test-user-id', 20, 0);
    expect(service.fetchContentHistory).toHaveBeenNthCalledWith(2, 'test-user-id', 20, 20);
  });
  it('should refresh history', async () => {
    const mockHistory = [{ id: 'content-1', source_type: 'PASTE' }];
    queryClient.setQueryData(
      contentStudyQueryKeys.history('test-user-id'),
      { pages: [mockHistory], pageParams: [0] },
    );
    const baseWrapper = createWrapper(queryClient);
    const wrapper = ({ children }: { children: React.ReactNode }) => 
      React.createElement(ToastProvider, null, baseWrapper({ children }));
    const { result } = await renderHook(() => useContentHistory(), { wrapper });
    await waitFor(
      () => {
        expect(result.current.content).toEqual(mockHistory);
      },
      { timeout: 3000 },
    );
    // Invalidate cache so refetch triggers a new query
    await queryClient.invalidateQueries({
      queryKey: contentStudyQueryKeys.all,
    });
    // After invalidation, content should be stale but refetch should be available
    expect(typeof result.current.refetch).toBe('function');
  });
});

describe('useRateLimit', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
        mutations: { gcTime: 0 },
      },
    });
    jest.clearAllMocks();
  });

  it('should check rate limit and return remaining', async () => {
    const mockHistory = [
      {
        id: 'content-1',
        lastGenerationDate: new Date().toISOString().slice(0, 10),
      },
    ];
    (service.fetchContentHistory as jest.Mock).mockResolvedValue(mockHistory);
    const baseWrapper = createWrapper(queryClient);
    const wrapper = ({ children }: { children: React.ReactNode }) => 
      React.createElement(ToastProvider, null, baseWrapper({ children }));
    const { result } = await renderHook(() => useRateLimit(), { wrapper });
    await act(async () => {
      await result.current.checkLimit();
    });
    expect(result.current.remaining).toBe(9);
    expect(result.current.isChecking).toBe(false);
  });

  it('should handle rate limit errors', async () => {
    (service.fetchContentHistory as jest.Mock).mockRejectedValue(
      new Error('Rate limit check failed'),
    );
    const baseWrapper = createWrapper(queryClient);
    const wrapper = ({ children }: { children: React.ReactNode }) => 
      React.createElement(ToastProvider, null, baseWrapper({ children }));
    const { result } = await renderHook(() => useRateLimit(), { wrapper });
    await act(async () => {
      try {
        await result.current.checkLimit();
      } catch {
        // expected
      }
    });
    expect(result.current.isChecking).toBe(false);
  });
});
