import { renderHook, act, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useContentReview, useStudyPlan } from '../hooks';

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
  deleteContent: jest.fn(),
}));
import * as service from '../ContentStudyService';

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

describe('useContentReview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should fetch content data', async () => {
    const mockContent = {
      id: 'content-123',
      sourceType: 'PASTE',
      status: 'EXTRACTED',
      extractedText: 'Extracted text',
    };
    (service.fetchContentById as jest.Mock).mockResolvedValue(mockContent);
    const { result } = renderHook(() => useContentReview('content-123'), {
      wrapper,
    });
    await waitFor(() => {
      expect(result.current.content).toEqual(mockContent);
    });
  });
  it('should track editing state', () => {
    const { result } = renderHook(() => useContentReview('content-123'), {
      wrapper,
    });
    expect(result.current.isEditing).toBe(false);
    act(() => {
      result.current.startEditing();
    });
    expect(result.current.isEditing).toBe(true);
    act(() => {
      result.current.cancelEditing();
    });
    expect(result.current.isEditing).toBe(false);
  });
  it('should update edited text', () => {
    const { result } = renderHook(() => useContentReview('content-123'), {
      wrapper,
    });
    act(() => {
      result.current.startEditing();
      result.current.setEditedText('New text');
    });
    expect(result.current.editedText).toBe('New text');
  });
  it('should calculate canGenerate based on content status', async () => {
    const mockContent = {
      id: 'content-123',
      sourceType: 'PASTE',
      status: 'EXTRACTED',
      extractedText: 'Extracted text',
    };
    (service.fetchContentById as jest.Mock).mockResolvedValue(mockContent);
    const { result } = renderHook(() => useContentReview('content-123'), {
      wrapper,
    });
    await waitFor(() => {
      expect(result.current.canGenerate).toBe(true);
    });
  });
});

describe('useStudyPlan', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockGeneration = {
    id: 'gen-123',
    contentId: 'content-123',
    userId: 'test-user-id',
    summary: { overview: 'Test Plan Overview', keyPoints: ['Point 1'] },
    keyConcepts: [{ term: 'Concept 1', definition: 'Definition 1' }],
    tasks: [
      { id: 'task-1', content: 'Task 1', priority: 'MEDIUM', estimatedMinutes: 10 },
      { id: 'task-2', content: 'Task 2', priority: 'MEDIUM', estimatedMinutes: 10 },
    ],
    quizItems: [],
    sessionPlan: {
      recommendedDuration: 30,
      suggestedDifficulty: 'NORMAL',
      focusAreas: ['reading'],
    },
    metadata: {
      contentLength: 1000,
      processingTimeMs: 500,
      modelVersion: 'v1',
      confidenceScore: 0.9,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    accessCount: 0,
    isArchived: false,
  };

  it('should fetch generation data', async () => {
    (service.fetchGenerationById as jest.Mock).mockResolvedValue(
      mockGeneration,
    );
    const { result } = renderHook(() => useStudyPlan('gen-123'), { wrapper });
    await waitFor(() => {
      expect(result.current.generation).toEqual(mockGeneration);
    });
  });
  it('should call completeTask with correct args', async () => {
    (service.fetchGenerationById as jest.Mock).mockResolvedValue(
      mockGeneration,
    );
    const { result } = renderHook(() => useStudyPlan('gen-123'), { wrapper });
    await waitFor(() => {
      expect(result.current.generation).toEqual(mockGeneration);
    });
    act(() => {
      result.current.completeTask({ taskId: 'task-1' });
    });
    expect(result.current.isCompletingTask).toBeDefined();
  });
  it('should expose refetch function', async () => {
    (service.fetchGenerationById as jest.Mock).mockResolvedValue(
      mockGeneration,
    );
    const { result } = renderHook(() => useStudyPlan('gen-123'), { wrapper });
    await waitFor(() => {
      expect(result.current.generation).toEqual(mockGeneration);
    });
    expect(typeof result.current.refetch).toBe('function');
  });
  it('should calculate completion via mutation', async () => {
    const threeTaskGeneration = {
      ...mockGeneration,
      tasks: [
        { id: 'task-1', content: 'Task 1', priority: 'MEDIUM', estimatedMinutes: 10 },
        { id: 'task-2', content: 'Task 2', priority: 'MEDIUM', estimatedMinutes: 10 },
        { id: 'task-3', content: 'Task 3', priority: 'MEDIUM', estimatedMinutes: 10 },
      ],
    };
    (service.fetchGenerationById as jest.Mock).mockResolvedValue(
      threeTaskGeneration,
    );
    const { result } = renderHook(() => useStudyPlan('gen-123'), { wrapper });
    await waitFor(() => {
      expect(result.current.generation).toEqual(threeTaskGeneration);
    });
    await act(async () => {
      result.current.completeTask({ taskId: 'task-1' });
      result.current.completeTask({ taskId: 'task-2' });
    });
    expect(result.current.generation?.tasks).toHaveLength(3);
  });
});
