/**
 * Focus Identity — Service
 *
 * Business logic barrel for the focus-identity feature.
 * Re-exports from the canonical service implementation.
 */
export { FocusIdentityService } from './focus-identity-service';

export { createMonthlyFocusReport } from './focus-identity-monthly-report';
export { createInitialFocusIdentityProfile } from './focus-identity-profile-factory';
