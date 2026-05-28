import { useCallback, useRef, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Sentry from "@sentry/react-native";
import { useDisclosureAnalytics } from "../../../features/liveops-config";
import type { ExtendedRootStackParams } from "../../../navigation/types";
import { useOnboardingStore } from "../../../features/onboarding";
import { useSessionUIStore } from "../../../store/session-state";
import { triggerHaptic } from "../../../utils/haptics";

type NavigationProp = NativeStackNavigationProp<ExtendedRootStackParams>;

export function useOnboardingCompletion(userId: string) {
  const navigation = useNavigation<NavigationProp>();
  const completeOnboarding = useOnboardingStore(
    (state) => state.completeOnboarding,
  );
  const showHomeHighlight = useSessionUIStore(
    (state) => state.showHomeHighlight,
  );
  const disclosureAnalytics = useDisclosureAnalytics();
  const [isFinishing, setIsFinishing] = useState(false);
  const [finishError, setFinishError] = useState<string | null>(null);
  const completedRef = useRef(false);

  const finishOnboarding = useCallback(
    async (
      goal: string | undefined,
      starterPresetId: string | undefined,
      message?: string,
    ): Promise<void> => {
      if (!userId || !goal || !starterPresetId) return;
      setIsFinishing(true);
      setFinishError(null);
      completedRef.current = true;
      try {
        completeOnboarding();
        disclosureAnalytics.trackOnboardingCompleted(userId);
        showHomeHighlight({
          title: "VEX is ready for your first real session",
          message:
            message ??
            "Start one clean focus block and VEX will begin tailoring the next action around your progress.",
          tone: "celebration",
        });
        triggerHaptic("success").catch(() => undefined);
        navigation.replace("Main", {
          screen: "Home",
          params: message ? { comebackMessage: message } : undefined,
        });
      } catch (error) {
        Sentry.captureException(error, {
          tags: { feature: "onboarding", operation: "finishOnboarding" },
        });
        completedRef.current = false;
        setFinishError(
          "We could not finish setup right now. Please try once more.",
        );
      } finally {
        setIsFinishing(false);
      }
    },
    [
      completeOnboarding,
      disclosureAnalytics,
      navigation,
      showHomeHighlight,
      userId,
    ],
  );

  return { isFinishing, finishError, completedRef, finishOnboarding };
}
