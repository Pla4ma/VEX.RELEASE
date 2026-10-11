import type { ErrorInfo } from 'react';
import * as Sentry from '@sentry/react-native';
import { getAnalyticsService } from '../analytics/AnalyticsService';
import { createDebugger } from '../utils/debug';
import type { ErrorCategory } from './ErrorBoundary.types';

const debug = createDebugger('error');

export function reportBoundaryError(error: Error, errorInfo: ErrorInfo, category: ErrorCategory): void {
  try {
    Sentry.captureException(error, { tags: { errorBoundary: 'root', category },
      extra: { componentStack: errorInfo.componentStack } });
  } catch (captureError: unknown) {
    debug.warn('Error reporting unavailable', captureError);
  }
  try {
    getAnalyticsService().track('error', { error: error.message, category,
      stack: __DEV__ ? error.stack : undefined,
      componentStack: errorInfo.componentStack, fatal: category === 'client' });
  } catch (analyticsError: unknown) {
    // Telemetry must never crash the fallback that handles the original failure.
    try { Sentry.captureException(analyticsError, { tags: { errorBoundary: 'telemetry' } }); }
    catch (captureError: unknown) { debug.warn('Error telemetry unavailable', captureError); }
  }
}
