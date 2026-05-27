import React from "react";

import { Box } from "../../../components/primitives/Box";
import { Button } from "../../../components/primitives/Button";
import { Text } from "../../../components/primitives/Text";
import { SessionDegradedState } from "../../../session/components/states/SessionDegradedState";
import { SessionEmptyState } from "../../../session/components/states/SessionEmptyState";
import { SessionErrorState } from "../../../session/components/states/SessionErrorState";
import { SessionLoadingState } from "../../../session/components/states/SessionLoadingState";

type GuardSession = {
  canRecover?: boolean;
  status?: string;
  storageStatus?: string;
};

type ActiveSessionGuardStatesProps = {
  companionLoaded: boolean;
  error: Error | null;
  isDegradedSession: boolean;
  isLoading: boolean;
  onBrowsePresets: () => void;
  onContinueDegraded: () => void;
  onCreateSession: () => void;
  onEndSession: () => void;
  onGoBack: () => void;
  onRetry: () => void;
  session: GuardSession | null;
  userId: string;
};

export function ActiveSessionGuardStates({
  companionLoaded,
  error,
  isDegradedSession,
  isLoading,
  onBrowsePresets,
  onContinueDegraded,
  onCreateSession,
  onEndSession,
  onGoBack,
  onRetry,
  session,
  userId,
}: ActiveSessionGuardStatesProps): JSX.Element | null {
  if (!userId) {
    return (
      <Box
        flex={1}
        bg="background.primary"
        justifyContent="center"
        alignItems="center"
        p="lg"
      >
        <Text variant="h4" color="error.DEFAULT" mb="md">
          Not authenticated
        </Text>
        <Button
          variant="primary"
          onPress={onGoBack}
          accessibilityLabel="Go back to the previous screen"
        >
          Go Back
        </Button>
      </Box>
    );
  }

  if (isLoading || !companionLoaded) {
    return <SessionLoadingState message="Loading focus session..." />;
  }

  if (error) {
    return (
      <SessionErrorState error={error} onRetry={onRetry} onGoBack={onGoBack} />
    );
  }

  if (!session) {
    return (
      <SessionEmptyState
        onCreateSession={onCreateSession}
        onBrowsePresets={onBrowsePresets}
      />
    );
  }

  if (!isDegradedSession) {
    return null;
  }

  return (
    <SessionDegradedState
      reason="Realtime purity tracking or persistence is temporarily limited."
      features={[
        { name: "Core timer", available: true },
        { name: "Purity updates", available: true },
        {
          name: "Full persistence sync",
          available: session.storageStatus !== "DEGRADED",
          reason: "Storage is currently in degraded mode.",
        },
        {
          name: "Recovery safeguards",
          available: Boolean(session.canRecover),
          reason: session.canRecover
            ? undefined
            : "Recovery is not currently available.",
        },
      ]}
      onRetryFullMode={onRetry}
      onContinueAnyway={onContinueDegraded}
      onEndSession={onEndSession}
    />
  );
}
