/**
 * OnboardingResumePrompt Component
 *
 * Shown when a user returns after partially completing onboarding.
 * Helps them resume where they left off.
 *
 * @phase 2 - Deepening: Abandon recovery UI
 */

import React, { useEffect, useState } from "react";
import { View } from "react-native";
import Animated, { FadeIn, FadeInUp, FadeOut } from "react-native-reanimated";

import { Text } from "../../../components/primitives/Text";
import { Button } from "../../../components/primitives/Button";
import { Box } from "../../../components/primitives/Box";
import { useTheme } from "../../../theme";
import { triggerHapticEvent, HapticEvents } from "../../../constants/haptics";
import { eventBus } from "../../../events";
import { OnboardingPersistence, getPartialData, getAbandonCount, isHighAbandonRisk } from "../utils/persistence";
import type { OnboardingStep } from "../types";
import { createSheet } from "@/shared/ui/create-sheet";

interface OnboardingResumePromptProps {
  onResume: () => void;
  onRestart: () => void;
  onDismiss: () => void;
}

interface ResumeState {
  step: OnboardingStep | null;
  stepNumber: number;
  partialData: Record<string, unknown>;
  abandonCount: number;
  isHighRisk: boolean;
}

export function OnboardingResumePrompt({ onResume, onRestart, onDismiss }: OnboardingResumePromptProps): JSX.Element | null {
  const { theme } = useTheme();
  const [state, setState] = useState<ResumeState | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  useEffect(() => {
    // Check if there's incomplete onboarding
    const hasIncomplete = OnboardingPersistence.hasIncomplete();

    if (!hasIncomplete) {
      return;
    }

    const step = OnboardingPersistence.getResumeStep();
    const partialData = getPartialData() || {};
    const abandonCount = getAbandonCount();
    const isHighRisk = isHighAbandonRisk();

    if (step) {
      const stepNumber = getStepNumber(step);

      setState({
        step,
        stepNumber,
        partialData,
        abandonCount,
        isHighRisk,
      });

      setIsVisible(true);

      triggerHapticEvent(HapticEvents.WARNING);

      eventBus.publish("analytics:track", {
        event: "onboarding_resume_prompt_shown",
        properties: {
          step,
          stepNumber,
          abandonCount,
          isHighRisk,
        },
      });
    }
  }, []);

  const getStepNumber = (step: OnboardingStep): number => {
    const steps: OnboardingStep[] = ["WELCOME", "GOAL_SETTING", "FOCUS_TIME", "NAME_SETUP", "FIRST_SESSION_CTA"];
    return steps.indexOf(step);
  };

  const getStepLabel = (step: OnboardingStep): string => {
    const labels: Record<OnboardingStep, string> = {
      WELCOME: "Welcome",
      GOAL_SETTING: "Goal Setting",
      FOCUS_TIME: "Focus Duration",
      NAME_SETUP: "Name Setup",
      FIRST_SESSION_CTA: "First Session",
    };
    return labels[step] || step;
  };

  const getProgressSummary = (): string => {
    if (!state) {
      return "";
    }

    const completed = [];
    if (state.partialData.goal) {
      completed.push("goal");
    }
    if (state.partialData.focusDuration) {
      completed.push("focus duration");
    }
    if (state.partialData.displayName) {
      completed.push("name");
    }

    if (completed.length === 0) {
      return "You started but didn't complete any steps.";
    }
    return `You've already set your ${completed.join(", ")}.`;
  };

  const handleResume = () => {
    setSelectedAction("resume");

    eventBus.publish("analytics:track", {
      event: "onboarding_resume_selected",
      properties: {
        step: state?.step,
        abandonCount: state?.abandonCount,
      },
    });

    onResume();
    setIsVisible(false);
  };

  const handleRestart = () => {
    setSelectedAction("restart");

    eventBus.publish("analytics:track", {
      event: "onboarding_restart_selected",
      properties: {
        step: state?.step,
        abandonCount: state?.abandonCount,
      },
    });

    OnboardingPersistence.clear();
    onRestart();
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setSelectedAction("dismiss");

    eventBus.publish("analytics:track", {
      event: "onboarding_resume_dismissed",
      properties: {
        step: state?.step,
        abandonCount: state?.abandonCount,
      },
    });

    onDismiss();
    setIsVisible(false);
  };

  if (!isVisible || !state) {
    return null;
  }

  return (
    <Box position="absolute" top={0} left={0} right={0} bottom={0} bg="rgba(0,0,0,0.7)" justifyContent="center" alignItems="center" p="lg" zIndex={1000}>
      <Animated.View entering={FadeIn} exiting={FadeOut}>
        <Box bg="background.primary" p="xl" borderRadius="xl" width="100%" maxWidth={400}>
          <Animated.View entering={FadeInUp.delay(100)}>
            {/* Icon */}
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary[100] }]}>
              <Text style={styles.icon}>👋</Text>
            </View>

            {/* Title */}
            <Text variant="h3" textAlign="center" mb="md">
              Welcome Back!
            </Text>

            {/* Description */}
            <Text variant="body" color="text.secondary" textAlign="center" mb="lg">
              You started setting up your focus journey but didn't finish.
              {getProgressSummary()}
            </Text>

            {/* Progress indicator */}
            <Box bg="background.secondary" p="md" borderRadius="lg" mb="md">
              <Box flexDirection="row" justifyContent="space-between" mb="xs">
                <Text variant="bodySmall" color="text.tertiary">
                  Setup Progress
                </Text>
                <Text variant="bodySmall" color="text.secondary">
                  Step {state.stepNumber} of 4
                </Text>
              </Box>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${(state.stepNumber / 4) * 100}%`,
                      backgroundColor: theme.colors.primary[500],
                    },
                  ]}
                />
              </View>
              <Text variant="caption" color="text.tertiary" textAlign="center" mt="xs">
                Next up: {getStepLabel(state.step!)}
              </Text>
            </Box>

            {/* High abandon risk warning */}
            {state.isHighRisk && (
              <Animated.View entering={FadeInUp.delay(200)}>
                <Box bg={theme.colors.warning.light} p="md" borderRadius="lg" mb="lg">
                  <Text variant="bodySmall" color={theme.colors.warning.DEFAULT} textAlign="center">
                    ⚠️ We noticed you've had trouble completing setup. It only takes 2 minutes to finish!
                  </Text>
                </Box>
              </Animated.View>
            )}

            {/* Actions */}
            <Box gap="sm">
              <Button variant="primary" size="lg" onPress={handleResume} disabled={selectedAction !== null} isLoading={selectedAction === "resume"} accessibilityLabel="Continue Setup → button" accessibilityRole="button" accessibilityHint="Activates this control">
                Continue Setup →
              </Button>

              <Button variant="secondary" size="md" onPress={handleRestart} disabled={selectedAction !== null} isLoading={selectedAction === "restart"} accessibilityLabel="Start Fresh button" accessibilityRole="button" accessibilityHint="Activates this control">
                Start Fresh
              </Button>

              <Button variant="ghost" size="sm" onPress={handleDismiss} disabled={selectedAction !== null} accessibilityLabel="Skip for Now button" accessibilityRole="button" accessibilityHint="Activates this control">
                Skip for Now
              </Button>
            </Box>

            {/* Help text */}
            <Text variant="caption" color="text.tertiary" textAlign="center" mt="lg">
              You can always complete setup later from Settings.
            </Text>
          </Animated.View>
        </Box>
      </Animated.View>
    </Box>
  );
}

const styles = createSheet({
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 16,
  },
  icon: {
    fontSize: 30,
  },
  progressBar: {
    height: 6,
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
});

export default OnboardingResumePrompt;
