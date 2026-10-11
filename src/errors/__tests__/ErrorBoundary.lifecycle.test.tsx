import { ThrowNetworkError, mockAnalytics } from './ErrorBoundary.test.helpers';
import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { ErrorBoundary } from '../ErrorBoundary';
import { reportBoundaryError } from '../ErrorBoundary.reporting';
import * as Sentry from '@sentry/react-native';

beforeEach(() => jest.clearAllMocks());

it('does not schedule another recovery after unmount while reset is pending', async (): Promise<void> => {
  let finish: (() => void) | undefined;
  const onReset = jest.fn((): Promise<void> => new Promise((resolve) => { finish = resolve; }));
  const ref = React.createRef<ErrorBoundary>();
  const screen = await render(<ErrorBoundary ref={ref} onReset={onReset} retryDelay={60000}><ThrowNetworkError /></ErrorBoundary>);
  await fireEvent.press(screen.getByText('Try Again'));
  if (!ref.current) { throw new Error('Boundary did not mount'); }
  const setState = jest.spyOn(ref.current, 'setState');
  await waitFor(() => expect(onReset).toHaveBeenCalledTimes(1));
  await screen.unmount();
  await act(async (): Promise<void> => { finish?.(); await Promise.resolve(); });
  expect(setState).not.toHaveBeenCalled();
  expect(onReset).toHaveBeenCalledTimes(1);
});

it('coalesces repeated manual retries while recovery is in progress', async (): Promise<void> => {
  let finish: (() => void) | undefined;
  const onReset = jest.fn((): Promise<void> => new Promise((resolve) => { finish = resolve; }));
  const ref = React.createRef<ErrorBoundary>();
  const screen = await render(<ErrorBoundary ref={ref} onReset={onReset} retryDelay={60000}><ThrowNetworkError /></ErrorBoundary>);
  const retry = screen.getByText('Try Again');
  await Promise.all([fireEvent.press(retry), fireEvent.press(retry)]);
  expect(onReset).toHaveBeenCalledTimes(1);
  await screen.unmount();
  await act(async (): Promise<void> => { finish?.(); await Promise.resolve(); });
});

it('keeps the original error fallback usable when analytics throws', () => {
  mockAnalytics.track.mockImplementationOnce(() => { throw new Error('Analytics unavailable'); });
  expect(() => reportBoundaryError(new Error('Original failure'), { componentStack: '' }, 'network')).not.toThrow();
  expect(Sentry.captureException).toHaveBeenCalledWith(expect.any(Error),
    expect.objectContaining({ tags: { errorBoundary: 'telemetry' } }));
});
