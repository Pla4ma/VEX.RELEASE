import * as Sentry from '@sentry/react-native';

type SilentFailureType = 'data' | 'network' | 'ui';

interface SilentFailureContext {
  feature: string;
  operation: string;
  type: SilentFailureType;
}

export function captureSilentFailure(
  error: unknown,
  context: SilentFailureContext,
): void {
  Sentry.captureException(error, {
    tags: {
      feature: context.feature,
      operation: context.operation,
      failureType: context.type,
    },
    extra: {
      fallback:
        'Existing safe fallback preserved after previously empty catch.',
    },
  });
}
