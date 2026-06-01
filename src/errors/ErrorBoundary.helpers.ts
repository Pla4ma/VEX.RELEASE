import type { ErrorCategory } from './ErrorBoundary.types';

export function categorizeError(error: Error): ErrorCategory {
  const message = error.message.toLowerCase();
  const name = error.name.toLowerCase();
  if (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('timeout')
  ) {
    return 'network';
  }
  if (
    message.includes('auth') ||
    message.includes('unauthorized') ||
    message.includes('token')
  ) {
    return 'auth';
  }
  if (message.includes('validation') || message.includes('invalid')) {
    return 'validation';
  }
  if (
    message.includes('server') ||
    message.includes('500') ||
    message.includes('503')
  ) {
    return 'server';
  }
  if (
    name.includes('error') &&
    !name.includes('reference') &&
    !name.includes('type')
  ) {
    return 'client';
  }
  return 'unknown';
}

export function calculateRetryDelay(attempt: number, baseDelay: number): number {
  const exponential = Math.pow(2, attempt) * baseDelay;
  const jitter = Math.random() * 1000;
  return Math.min(exponential + jitter, 30000);
}
