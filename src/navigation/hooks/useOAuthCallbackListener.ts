import { useEffect } from 'react';
import { Linking } from 'react-native';
import * as Sentry from '@sentry/react-native';

function isAuthCallbackUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'vex:' && parsed.hostname === 'auth'
      && parsed.pathname === '/callback';
  } catch (error: unknown) {
    return false;
  }
}

export function useOAuthCallbackListener(
  completeOAuthCallback: (url: string) => Promise<boolean>,
): void {
  useEffect(() => {
    const handleAuthCallback = (url: string): void => {
      if (!isAuthCallbackUrl(url)) {
        return;
      }
      completeOAuthCallback(url).catch((error: unknown) => {
        Sentry.captureException(error, { tags: { feature: 'auth-oauth-callback' } });
      });
    };

    Linking.getInitialURL()
      .then((url) => {
        if (url) {
          handleAuthCallback(url);
        }
      })
      .catch((error: unknown) => {
        Sentry.captureException(error, { tags: { feature: 'auth-initial-url' } });
      });

    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleAuthCallback(url);
    });

    return () => {
      subscription.remove();
    };
  }, [completeOAuthCallback]);
}
