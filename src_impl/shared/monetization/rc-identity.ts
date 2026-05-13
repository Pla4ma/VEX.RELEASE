/**
 * RevenueCat Identity Helpers
 * Standalone functions for user identification and logout.
 */

import Purchases from 'react-native-purchases';
import * as Sentry from '@sentry/react-native';
import { createDebugger } from '../../utils/debug';
import { normalizeError } from './rc-errors';

const debug = createDebugger('monetization:revenuecat');

// ============================================================================
// RCIdentityContext - service state needed by identity helpers
// ============================================================================

export interface RCIdentityContext {
  isReady: () => boolean;
  debugMode: boolean;
  setCurrentUserId: (id: string | null) => void;
}

// ============================================================================
// Identify
// ============================================================================

export async function identifyUser(
  ctx: RCIdentityContext,
  appUserId: string
): Promise<boolean> {
  if (!ctx.isReady()) {
    return false;
  }
  try {
    await Purchases.logIn(appUserId);
    ctx.setCurrentUserId(appUserId);
    if (ctx.debugMode) {
      debug.debug('[RevenueCat] User identified:', appUserId);
    }
    return true;
  } catch (error) {
    const err = normalizeError(error);
    if (ctx.debugMode) {
      debug.error('[RevenueCat] Identify user failed', err);
    }
    Sentry.captureException(err.underlyingError || new Error(err.message), {
      tags: { component: 'RevenueCatService', operation: 'identifyUser' },
      extra: { appUserId },
    });
    return false;
  }
}

// ============================================================================
// Logout
// ============================================================================

export async function logoutUser(ctx: RCIdentityContext): Promise<boolean> {
  if (!ctx.isReady()) {
    return false;
  }
  try {
    await Purchases.logOut();
    ctx.setCurrentUserId(null);
    if (ctx.debugMode) {
      debug.debug('[RevenueCat] User logged out');
    }
    return true;
  } catch (error) {
    const err = normalizeError(error);
    debug.error('[RevenueCat] Logout failed', err);
    Sentry.captureException(err.underlyingError || new Error(err.message), {
      tags: { component: 'RevenueCatService', operation: 'logoutUser' },
    });
    return false;
  }
}
