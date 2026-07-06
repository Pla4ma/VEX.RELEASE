import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { Platform } from 'react-native';
import * as Sentry from '@sentry/react-native';
import { createDebugger } from '../../utils/debug';

const debug = createDebugger('monetization:revenuecat');

export const IOS_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;
export const ANDROID_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;

const PLACEHOLDER_PATTERN = /^(your[_\-].*|test[_\-].*|placeholder|REPLACE_ME|TODO|rc_(sk|pub)_(test|live)_)/i;

export function isPlaceholderKey(key: string | undefined): boolean {
  if (!key || key.length === 0) { return false; }
  return PLACEHOLDER_PATTERN.test(key.trim());
}

export function validateKeys(): { valid: boolean; reason?: string } {
  if (!IOS_API_KEY && !ANDROID_API_KEY) {
    if (__DEV__) {
      debug.error('[RevenueCat] CRITICAL: No API keys configured. Set EXPO_PUBLIC_REVENUECAT_IOS_KEY and EXPO_PUBLIC_REVENUECAT_ANDROID_KEY in .env.local');
    }
    return { valid: false, reason: 'missing_keys' };
  }
  const iosPlaceholder = isPlaceholderKey(IOS_API_KEY);
  const androidPlaceholder = isPlaceholderKey(ANDROID_API_KEY);
  if (iosPlaceholder || androidPlaceholder) {
    const msg = iosPlaceholder && androidPlaceholder
      ? 'Both RevenueCat API keys are placeholders'
      : `${iosPlaceholder ? 'iOS' : 'Android'} RevenueCat API key is a placeholder`;
    debug.error(`[RevenueCat] ${msg}. IAP will not work.`);
    Sentry.captureMessage(`[RevenueCat] ${msg}`, { level: 'error', tags: { component: 'RevenueCatService' } });
    return { valid: false, reason: 'missing_keys' };
  }
  return { valid: true };
}

export function configureSdk(debugMode: boolean): boolean {
  const apiKey = Platform.OS === 'ios' ? IOS_API_KEY : ANDROID_API_KEY;
  if (!apiKey) { return false; }
  Purchases.configure({ apiKey, appUserID: undefined });
  Purchases.setLogLevel(debugMode ? LOG_LEVEL.DEBUG : LOG_LEVEL.ERROR);
  return true;
}
