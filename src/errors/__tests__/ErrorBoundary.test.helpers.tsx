import React from 'react';

import { getAnalyticsService } from '../../analytics/AnalyticsService';

jest.mock('../../analytics/AnalyticsService');
jest.mock('../../utils/debug', () => ({
  createDebugger: () => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }),
}));

export const mockAnalytics = { track: jest.fn() };
(getAnalyticsService as jest.Mock).mockReturnValue(mockAnalytics);

export const ThrowError = ({
  shouldThrow,
}: {
  shouldThrow: boolean;
}) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>Normal render</div>;
};

export const ThrowNetworkError = () => {
  const error = new Error('Network request failed');
  error.name = 'NetworkError';
  throw error;
};

export const ThrowAuthError = () => {
  const error = new Error('Unauthorized');
  error.name = 'AuthError';
  throw error;
};

export const ThrowClientError = () => {
  const error = new Error('Client error');
  throw error;
};
