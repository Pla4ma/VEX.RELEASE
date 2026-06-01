/**
 * Exit Gate Verifiers — barrel re-export.
 *
 * Split into focused modules under 200 lines each:
 *   ExitGate.verifier-utils.ts   — shared helpers
 *   ExitGate.verifiers.sync.ts   — offline sync & error boundaries
 *   ExitGate.verifiers.ux.ts     — accessibility & performance
 *   ExitGate.verifiers.compliance.ts — privacy & paywall
 *   ExitGate.verifiers.appstore.ts   — app store submission
 */

export { verifyOfflineSync, verifyErrorBoundaries } from './ExitGate.verifiers.sync';
export { verifyAccessibility, verifyPerformance } from './ExitGate.verifiers.ux';
export { verifyPrivacy, verifyPaywall } from './ExitGate.verifiers.compliance';
export { verifyAppStore } from './ExitGate.verifiers.appstore';
