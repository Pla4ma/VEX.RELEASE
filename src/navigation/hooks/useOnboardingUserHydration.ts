import { useEffect, useState } from 'react';
import * as Sentry from '@sentry/react-native';

import { hydrateOnboardingForUser } from '../../features/onboarding/store';

export function useOnboardingUserHydration(
  userId: string | null,
): boolean {
  const [hydratedUserId, setHydratedUserId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void hydrateOnboardingForUser(userId)
      .then(() => {
        if (active) {
          setHydratedUserId(userId);
        }
      })
      .catch((error: unknown) => {
        Sentry.captureException(error, {
          tags: { feature: 'onboarding', operation: 'hydrate-user-scope' },
        });
      });
    return () => {
      active = false;
    };
  }, [userId]);

  return hydratedUserId === userId;
}
