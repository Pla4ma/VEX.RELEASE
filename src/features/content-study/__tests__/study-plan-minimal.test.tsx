import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useContentReview, useStudyPlan } from '../hooks';

jest.mock('@sentry/react-native', () => ({
  captureException: jest.fn(),
  addBreadcrumb: jest.fn(),
}));

jest.mock('../../../store', () => ({
  useAuthStore: () => ({
    user: { id: 'test-user-id', email: 'test@example.com' },
  }),
}));
jest.mock('../../../shared/ui/components/Toast', () => ({
  useToast: () => ({ show: jest.fn() }),
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

test('minimal test', () => {
  expect(1).toBe(1);
});
