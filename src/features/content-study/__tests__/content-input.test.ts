import { captureSilentFailure } from '../../../utils/silent-failure';
import { renderHook, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import {
  useContentInput,
  contentStudyQueryKeys,
} from '../hooks';

jest.mock('../../../store', () => ({
  useAuthStore: () => ({
    user: { id: 'test-user-id', email: 'test@example.com' },
  }),
}));

jest.mock('../ContentStudyService', () => ({
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
  checkRateLimit: jest.fn(),
}));

const createTestQueryClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } });
const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  return React.createElement(
    QueryClientProvider,
    { client: queryClient },
    children,
  );
};

describe('contentStudyQueryKeys', () => {
  it('should generate correct query keys', () => {
    expect(contentStudyQueryKeys.all).toEqual(['content-study']);
    expect(contentStudyQueryKeys.content('123')).toEqual([
      'content-study',
      'content',
      '123',
    ]);
    expect(contentStudyQueryKeys.generation('456')).toEqual([
      'content-study',
      'generation',
      '456',
    ]);
  });
});

describe('useContentInput', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useContentInput(), { wrapper });
    expect(result.current.state.activeTab).toBe('paste');
    expect(result.current.state.pastedText).toBe('');
    expect(result.current.state.youtubeUrl).toBe('');
    expect(result.current.state.selectedFile).toBeNull();
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.error).toBeNull();
  });
  it('should update tab', () => {
    const { result } = renderHook(() => useContentInput(), { wrapper });
    act(() => {
      result.current.setTab('youtube');
    });
    expect(result.current.state.activeTab).toBe('youtube');
  });
  it('should update pasted text', () => {
    const { result } = renderHook(() => useContentInput(), { wrapper });
    act(() => {
      result.current.setPastedText('Test content');
    });
    expect(result.current.state.pastedText).toBe('Test content');
  });
  it('should update YouTube URL', () => {
    const { result } = renderHook(() => useContentInput(), { wrapper });
    act(() => {
      result.current.setYoutubeUrl('https://youtube.com/watch?v=123');
    });
    expect(result.current.state.youtubeUrl).toBe(
      'https://youtube.com/watch?v=123',
    );
  });
  it('should update selected file', () => {
    const { result } = renderHook(() => useContentInput(), { wrapper });
    const file = {
      uri: 'file:///test.pdf',
      name: 'test.pdf',
      size: 1000,
      type: 'application/pdf',
    };
    act(() => {
      result.current.setSelectedFile(file);
    });
    expect(result.current.state.selectedFile).toEqual(file);
  });
  it('should clear error', () => {
    const { result } = renderHook(() => useContentInput(), { wrapper });
    act(() => {
      result.current.setPastedText('Test');
      result.current.clearError();
    });
    expect(result.current.error).toBeNull();
  });
  it('should validate pasted text before submit', async () => {
    const { result } = renderHook(() => useContentInput(), { wrapper });
    act(() => {
      result.current.setTab('paste');
      result.current.setPastedText('Short');
    });
    await act(async () => {
      try {
        await result.current.submit();
      } catch (error) {
        captureSilentFailure(error, {
          feature: 'content-study',
          operation: 'network-fallback',
          type: 'network',
        });
      }
    });
    expect(result.current.error).toBeTruthy();
  });
});
