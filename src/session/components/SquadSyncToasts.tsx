import { useEffect } from "react";
import Animated, { FadeInUp, FadeOut } from "react-native-reanimated";

import { Box } from "../../components/primitives/Box";
import { Text } from "../../components/primitives/Text";
import { useTheme } from "../../theme";
import type { SquadCompletionToast } from "./SquadSyncIndicator.types";

interface CompletionToastProps {
  toast: SquadCompletionToast;
  onDismiss: () => void;
}

export function SquadCompletionToastView({
  toast,
  onDismiss,
}: CompletionToastProps): JSX.Element {
  const { theme } = useTheme();

  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const durationText =
    toast.durationMinutes > 0 ? `${toast.durationMinutes}-min` : "";
  const message = durationText
    ? `${toast.memberName} just finished a ${durationText} session! 💪`
    : `${toast.memberName} completed their session! 💪`;

  return (
    <Animated.View
      entering={FadeInUp.duration(400)}
      exiting={FadeOut.duration(300)}
    >
      <Box
        flexDirection="row"
        alignItems="center"
        gap="sm"
        px="md"
        py="sm"
        borderRadius="xl"
        bg={`${theme.colors.success[500]}20`}
        borderWidth={1}
        borderColor={theme.colors.success.DEFAULT}
      >
        <Text fontSize={16}>✓</Text>
        <Text
          variant="bodySmall"
          color={theme.colors.success.DEFAULT}
          fontWeight="600"
        >
          {message}
        </Text>
      </Box>
    </Animated.View>
  );
}

export function SquadEncouragementToastView({
  message,
}: {
  message: string;
}): JSX.Element {
  const { theme } = useTheme();

  return (
    <Animated.View
      entering={FadeInUp.duration(400)}
      exiting={FadeOut.duration(300)}
    >
      <Box
        flexDirection="row"
        alignItems="center"
        gap="sm"
        px="md"
        py="sm"
        borderRadius="xl"
        bg={`${theme.colors.primary[500]}20`}
        borderWidth={1}
        borderColor={theme.colors.primary[500]}
      >
        <Text fontSize={16}>💪</Text>
        <Text
          variant="bodySmall"
          color={theme.colors.primary[500]}
          fontWeight="600"
        >
          {message}
        </Text>
      </Box>
    </Animated.View>
  );
}
