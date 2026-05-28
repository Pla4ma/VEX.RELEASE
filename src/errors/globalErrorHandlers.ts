import { createDebugger } from "../utils/debug";
import { captureException } from "../config/sentry";

const debug = createDebugger("error");

export function setupGlobalErrorHandler(): void {
  const originalHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
    debug.error(isFatal ? "Fatal Error" : "Error", error);
    if (!__DEV__) {
      captureException(error, {
        area: "globalErrorHandler",
        isFatal: !!isFatal,
      });
    }
    if (__DEV__) {
      debug.debug("Global Error Handler");
      debug.debug("Error: %s", error.message);
      debug.debug("Stack: %s", error.stack);
      debug.debug("Is Fatal: %s", String(isFatal));
    }
    if (originalHandler) {
      originalHandler(error, isFatal);
    }
  });
}

export function setupRejectionHandler(): void {
  try {
    const tracking = require("promise/setimmediate/rejection-tracking");
    tracking.enable({
      allRejections: true,
      onUnhandled: (_id: string, error: Error) => {
        debug.error("Unhandled promise rejection", error);
        captureException(error, { area: "unhandledRejection" });
      },
      onHandled: () => {},
    });
  } catch (error: unknown) {
    globalThis.addEventListener?.(
      "unhandledrejection",
      (event: PromiseRejectionEvent) => {
        const rejectionError =
          event.reason instanceof Error
            ? event.reason
            : new Error(String(event.reason));
        debug.error("Unhandled promise rejection (fallback)", rejectionError);
        captureException(rejectionError, { area: "unhandledRejectionFallback" });
      },
    );
  }
}
