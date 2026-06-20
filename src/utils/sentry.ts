// Tiny Sentry facade used by silent-failure. The real implementation lives
// in @sentry/react-native, but tests should never depend on the real SDK.
export const Sentry = {
  captureException: (err: unknown): void => {
    void err;
  },
  captureMessage: (msg: string, opts?: Record<string, unknown>): void => {
    void msg;
    void opts;
  },
};
