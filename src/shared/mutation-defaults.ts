import * as Sentry from '@sentry/react-native';

export interface MutationErrorHandlerOptions<TError = Error> {
  feature: string;
  errorToast?: string;
  onError?: (error: TError, variables: unknown, context: unknown) => void;
}

export function createMutationErrorHandler<TError = Error>(
  showToast: (opts: { message: string; type: string; duration?: number }) => void,
  opts: MutationErrorHandlerOptions<TError>,
): (error: TError, variables: unknown, context: unknown) => void {
  return (error, variables, _context) => {
    Sentry.captureException(error, {
      tags: { feature: opts.feature },
      extra: { variables },
    });
    if (opts.errorToast) {
      showToast({ message: opts.errorToast, type: 'error', duration: 4000 });
    }
    opts.onError?.(error, variables, _context);
  };
}

export function withErrorToast(
  feature: string,
  errorToast: string,
): {
  feature: string;
  errorToast: string;
} {
  return { feature, errorToast };
}
