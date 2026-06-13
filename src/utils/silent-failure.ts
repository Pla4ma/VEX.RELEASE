import { captureException } from '../config/sentry';

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
  const errorInstance =
    error instanceof Error ? error : new Error(String(error));
  captureException(errorInstance, {
    feature: context.feature,
    operation: context.operation,
    failureType: context.type,
    fallback:
      'Existing safe fallback preserved after previously empty catch.',
  });
}
