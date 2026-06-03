/**
 * Shared Sentry Initialization for Background Jobs
 *
 * Initializes Sentry exactly once per job process.
 * All job files should import from here instead of calling Sentry.init() directly.
 */

import * as Sentry from '@sentry/node';

let initialized = false;

export function initJobSentry(): void {
  if (initialized) return;
  initialized = true;

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
  });
}

export { Sentry };
