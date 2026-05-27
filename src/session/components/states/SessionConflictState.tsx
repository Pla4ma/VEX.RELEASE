import React, { useState } from "react";
import { ScrollView } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Text } from "../../../components/primitives/Text";
import { Button } from "../../../components/primitives/Button";
import { Box } from "../../../components/primitives/Box";
import { useTheme } from "../../../theme";
import { styles } from "./SessionConflictState.styles";
import { computeDifferences, handleResolve } from "./conflict-state-helpers";
import { ConflictDeviceCard } from "./ConflictDeviceCard";

interface SessionState {
  progress: number;
  elapsedTime: number;
  timestamp: number;
  deviceName?: string;
}

interface SessionConflictStateProps {
  localState: SessionState;
  remoteState: SessionState;
  onResolveLocal: () => void;
  onResolveRemote: () => void;
  onMerge?: () => void;
}

export function SessionConflictState({
  localState,
  remoteState,
  onResolveLocal,
  onResolveRemote,
  onMerge,
}: SessionConflictStateProps): JSX.Element {
  const { theme } = useTheme();
  const [selectedOption, setSelectedOption] = useState<
    "local" | "remote" | "merge" | null
  >(null);
  const [isResolving, setIsResolving] = useState(false);
  const { timeDifference, progressDifference } = computeDifferences(
    localState,
    remoteState,
  );

  const handleResolveOption = async (option: "local" | "remote" | "merge") => {
    setSelectedOption(option);
    setIsResolving(true);
    try {
      await handleResolve(
        option,
        localState,
        remoteState,
        onResolveLocal,
        onResolveRemote,
        onMerge,
      );
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <Box flex={1} bg="background.primary" p="lg">
      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeIn.duration(400)} style={styles.container}>
          {}
          <Text variant="h3" textAlign="center" mb="md">
            Session Conflict Detected
          </Text>

          {}
          <Text
            variant="body"
            color="text.secondary"
            textAlign="center"
            mb="lg"
          >
            We found different session data on another device. Choose which
            version to keep.
          </Text>

          {}
          <Box gap="md" mb="lg">
            <ConflictDeviceCard
              state={localState}
              label="This Device"
              badgeText="LOCAL"
              badgeColor={theme.colors.success.DEFAULT}
              isSelected={selectedOption === "local"}
              isLoading={isResolving && selectedOption === "local"}
              isDisabled={isResolving}
              onPress={() => handleResolveOption("local")}
              buttonText="Keep This Version"
              accessibilityLabel="Keep This Version button"
              delay={100}
            />

            <ConflictDeviceCard
              state={remoteState}
              label={remoteState.deviceName || "Other Device"}
              badgeText="REMOTE"
              badgeColor={theme.colors.info.DEFAULT}
              isSelected={selectedOption === "remote"}
              isLoading={isResolving && selectedOption === "remote"}
              isDisabled={isResolving}
              onPress={() => handleResolveOption("remote")}
              buttonText="Use Other Version"
              accessibilityLabel="Use Other Version button"
              delay={200}
            />
          </Box>

          {}
          <Box bg="background.tertiary" p="md" borderRadius="lg" mb="lg">
            <Text
              variant="bodySmall"
              color="text.tertiary"
              textAlign="center"
              mb="xs"
            >
              Difference Summary
            </Text>
            <Text variant="body" textAlign="center">
              Time diff: {Math.floor(timeDifference / 60000)}m{" "}
              {Math.floor((timeDifference % 60000) / 1000)}s • Progress diff:{" "}
              {progressDifference.toFixed(1)}%
            </Text>
          </Box>

          {}
          {onMerge && (
            <Animated.View entering={FadeIn.delay(300)}>
              <Button
                variant="ghost"
                size="md"
                onPress={() => handleResolveOption("merge")}
                isLoading={isResolving && selectedOption === "merge"}
                disabled={isResolving}
                accessibilityLabel="Try to Merge Both Versions button"
                accessibilityRole="button"
                accessibilityHint="Activates this control"
              >
                Try to Merge Both Versions
              </Button>
            </Animated.View>
          )}
        </Animated.View>
      </ScrollView>
    </Box>
  );
}

export default SessionConflictState;
