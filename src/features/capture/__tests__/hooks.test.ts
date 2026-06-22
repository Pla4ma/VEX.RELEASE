import { renderHook, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import * as Sentry from '@sentry/react-native';
import { useCaptureMutation, useCapturesQuery, useCaptureForm } from '../hooks';
import * as service from '../service';

jest.mock('../service');
jest.mock('@sentry/react-native');

const mockSubmitCapture = service.submitCapture as jest.Mock;
const mockLoadCaptures = service.loadCaptures as jest.Mock;
const mockCaptureException = Sentry.captureException as jest.Mock;

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useCaptureMutation', () => {
  beforeEach(() => jest.clearAllMocks());

  it('invalidates captures cache on success', async () => {
    const queryClient = new QueryClient();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
    mockSubmitCapture.mockResolvedValue({ item: { id: '1' }, error: null });

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children);

    const { result } = renderHook(() => useCaptureMutation('user-1'), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ type: 'braindump', content: 'test' });
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['captures', 'user-1'] });
  });

  it('reports errors to Sentry', async () => {
    mockSubmitCapture.mockResolvedValue({ item: null, error: new Error('fail') });

    const { result } = renderHook(() => useCaptureMutation('user-1'), { wrapper: createWrapper() });

    await act(async () => {
      try { await result.current.mutateAsync({ type: 'braindump', content: 'test' }); } catch {}
    });

    expect(mockCaptureException).toHaveBeenCalledWith(
      expect.any(Error),
      { tags: { feature: 'capture', operation: 'submitCapture' } }
    );
  });
});

describe('useCapturesQuery', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns items on success', async () => {
    const items = [{ id: '1', content: 'hello' }];
    mockLoadCaptures.mockResolvedValue({ items, error: null });

    const { result } = renderHook(() => useCapturesQuery('user-1'), { wrapper: createWrapper() });

    // Wait for the query to resolve
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    expect(result.current.data).toEqual(items);
  });

  it('does not fetch when userId is empty', () => {
    mockLoadCaptures.mockResolvedValue({ items: [], error: null });

    const { result } = renderHook(() => useCapturesQuery(''), { wrapper: createWrapper() });
    expect(result.current.fetchStatus).toBe('idle');
    expect(mockLoadCaptures).not.toHaveBeenCalled();
  });
});

describe('useCaptureForm', () => {
  it('manages form state', () => {
    const { result } = renderHook(() => useCaptureForm());

    expect(result.current.state.type).toBe('braindump');
    expect(result.current.state.content).toBe('');

    act(() => result.current.setType('voice'));
    expect(result.current.state.type).toBe('voice');

    act(() => result.current.setContent('hello'));
    expect(result.current.state.content).toBe('hello');

    act(() => result.current.clearError());
    expect(result.current.state.error).toBeNull();
  });
});
