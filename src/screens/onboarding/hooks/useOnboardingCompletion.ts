import { useCallback, useRef, useState } from 'react';
import * as Sentry from '@sentry/react-native';
import { useDisclosureAnalytics } from '../../../features/liveops-config';
import { useOnboardingStore } from '../../../features/onboarding/store';
import { useSyncOnboardingProgress } from '../../../features/onboarding/hooks';
import { useSessionUIStore } from '../../../store/session-state';
import { triggerHaptic } from '../../../utils/haptics';

export function useOnboardingCompletion(userId: string) {
  const completeOnboarding = useOnboardingStore(
    (state) => state.completeOnboarding,
  );
  const showHomeHighlight = useSessionUIStore(
    (state) => state.showHomeHighlight,
  );
  const disclosureAnalytics = useDisclosureAnalytics();
  const { syncFromStore, isSyncing } = useSyncOnboardingProgress(userId);
  const [isFinishing, setIsFinishing] = useState(false);
  const [finishError, setFinishError] = useState<string | null>(null);
  const completedRef = useRef(false);

  const finishOnboarding = useCallback(
    async (
      goal: string | undefined,
      message?: string,
    ): Promise<void> => {
      if (!userId) {return;}
      setIsFinishing(true);
      setFinishError(null);
      completedRef.current = true;
      try {
        completeOnboarding(userId);
        disclosureAnalytics.trackOnboardingCompleted(userId);
        showHomeHighlight({
          title: 'VEX is ready for your first real session',
          message:
            message ??
            'Start one clean focus block and VEX will begin tailoring the next action around your progress.',
          tone: 'celebration',
        });
        // Sync onboarding profile to Supabase for cross-device persistence
        await syncFromStore();
        triggerHaptic('success').catch(() => {
          // Haptic failure is non-critical — safe to swallow in onboarding completion
        });
      } catch (error) {
        Sentry.captureException(error, {
          tags: { feature: 'onboarding', operation: 'finishOnboarding' },
        });
        completedRef.current = false;
        setFinishError(
          'We could not finish setup right now. Please try once more.',
        );
      } finally {
        setIsFinishing(false);
      }
    },
    [
      completeOnboarding,
      disclosureAnalytics,
      showHomeHighlight,
      userId,
      syncFromStore,
    ],
  );

  return { isFinishing, finishError, completedRef, finishOnboarding };
}
