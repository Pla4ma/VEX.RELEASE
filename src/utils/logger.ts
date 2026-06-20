// Tiny logger used by debug + silent-failure helpers. In production this
// forwards to Sentry breadcrumbs. In tests it's stubbed via __mocks__.
export const logger = {
  error: (msg: string, meta?: Record<string, unknown>): void => {
    if (typeof console !== 'undefined') console.error(msg, meta);
  },
  warn: (msg: string, meta?: Record<string, unknown>): void => {
    if (typeof console !== 'undefined') console.warn(msg, meta);
  },
  info: (msg: string, meta?: Record<string, unknown>): void => {
    if (typeof console !== 'undefined') console.info(msg, meta);
  },
  debug: (msg: string, meta?: Record<string, unknown>): void => {
    if (typeof console !== 'undefined') console.debug(msg, meta);
  },
};
