import { createDebugger } from '../utils/debug';
import { captureException } from '../config/sentry';

const debug = createDebugger('error');

export function setupGlobalErrorHandler(): void {
  const originalHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
    debug.error(isFatal ? 'Fatal Error' : 'Error', error);
    if (!__DEV__) {
      captureException(error, {
        area: 'globalErrorHandler',
        isFatal: !!isFatal,
      });
    }
    if (__DEV__) {
      debug.debug('Global Error Handler');
      debug.debug('Error: %s', error.message);
      debug.debug('Stack: %s', error.stack);
      debug.debug('Is Fatal: %s', String(isFatal));
    }
    if (originalHandler) {
      originalHandler(error, isFatal);
    }
  });
}

export function setupRejectionHandler(): void {
  const addEventListener = globalThis.addEventListener;
  if (typeof addEventListener !== 'function') {
    return;
  }

  addEventListener.call(
    globalThis,
    'unhandledrejection',
    (event: Event) => {
      const reason = 'reason' in event ? event.reason : event;
      const rejectionError =
        reason instanceof Error
          ? reason
          : new Error(String(reason));
      debug.error('Unhandled promise rejection', rejectionError);
      captureException(rejectionError, { area: 'unhandledRejection' });
    },
  );
}
