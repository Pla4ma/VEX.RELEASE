import React, { useCallback, useState } from "react";
import { ScrollView } from "react-native";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Box } from "../../../components/primitives/Box";
import { Button } from "../../../components/primitives/Button";
import { Text } from "../../../components/primitives/Text";
import { SessionStartStatusCard } from "../../../features/session-start/components/SessionStartStatusCard";
import { SessionMode } from "../../../session/modes";
import type {
  ExtendedRootStackParams,
  SessionStackParams,
} from "../../../navigation/types";
import { SessionSetupHeader } from "./SessionSetupHeader";
import { FirstSessionSetupCard } from "./FirstSessionSetupCard";
import { useFirstSessionPersonalization } from "../hooks/useFirstSessionPersonalization";
import { useFirstSessionStart } from "../hooks/useFirstSessionStart";
import { useAuthStore } from "../../../store";
import { useOnboardingStore } from "../../../features/onboarding";

type SessionNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<SessionStackParams>,
  NativeStackNavigationProp<ExtendedRootStackParams>
>;

type FirstSessionViewProps = {
  navigation: SessionNavigationProp;
  onBack: () => void;
};

export function FirstSessionView({
  navigation,
  onBack,
}: FirstSessionViewProps): JSX.Element {
  const personalization = useFirstSessionPersonalization();
  const { user } = useAuthStore();
  const userId = user?.id ?? "";
  const markFirstSessionStarted = useOnboardingStore((s) => s.markFirstSessionStarted);
  const [offlineMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { handleFirstSessionStart, isStarting } = useFirstSessionStart({
    navigation,
    userId,
  });

  const handleStart = useCallback(
    (config: { mode: SessionMode; durationMinutes: number; goal?: string }) => {
      markFirstSessionStarted();
      handleFirstSessionStart(config).catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : "Unexpected session start failure";
        setError(message);
      });
    },
    [handleFirstSessionStart, markFirstSessionStarted],
  );

  if (!userId) {
    return (
      <Box flex={1} bg="background.primary" justifyContent="center" alignItems="center" p="lg">
        <Text variant="h4" color="error.DEFAULT" mb="md">
          Not authenticated
        </Text>
        <Button
          variant="primary"
          onPress={onBack}
          accessibilityLabel="Go back"
          accessibilityRole="button"
          accessibilityHint="Returns to the previous screen"
        >
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <Box flex={1} bg="background.primary">
      <SessionSetupHeader
        durationSeconds={personalization.suggestedDurationMinutes * 60}
        mode={personalization.defaultMode}
        onBack={onBack}
        userId={userId}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        <SessionStartStatusCard
          offlineMessage={offlineMessage}
          routeWarningMessage={null}
          startErrorMessage={error}
          onDismissStartError={() => setError(null)}
        />

        <FirstSessionSetupCard
          personalization={personalization}
          isStarting={isStarting}
          onStart={handleStart}
        />

        <Box height={120} />
      </ScrollView>
    </Box>
  );
}
