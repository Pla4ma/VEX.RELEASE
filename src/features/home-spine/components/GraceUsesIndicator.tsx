/**
 * GraceUsesIndicator Component
 *
 * Shows how many "mulligans" (grace uses) are remaining.
 * Small pill indicator near streak widget.
 *
 * @phase 2.5
 */

import React from "react";
import { Pressable } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { Box } from "../../../components/primitives/Box";
import { Text } from "../../../components/primitives/Text";
import { useTheme } from "../../../theme";

export interface GraceUsesIndicatorProps {
  /** Grace uses remaining */
  usesRemaining: number;
  /** Maximum grace uses */
  maxUses: number;
  /** Called when user taps for info */
  onPress?: () => void;
}

export function GraceUsesIndicator({
  usesRemaining,
  maxUses,
  onPress,
}: GraceUsesIndicatorProps): JSX.Element | null {
  const { theme } = useTheme();

  // Don't show if no grace uses available
  if (usesRemaining <= 0) {
    return null;
  }

  const isLow = usesRemaining === 1;

  return (
    <Animated.View entering={FadeIn.duration(300)}>
      <Pressable
        onPress={onPress}
        accessibilityLabel="🛡️ / saves button"
        accessibilityRole="button"
        accessibilityHint="Double tap to activate"
      >
        <Box
          flexDirection="row"
          alignItems="center"
          gap="xs"
          px="sm"
          py="xs"
          borderRadius="full"
          bg={
            isLow
              ? `${theme.colors.warning[50]}80`
              : `${theme.colors.info[50]}80`
          }
          borderWidth={1}
          borderColor={
            isLow ? theme.colors.warning.DEFAULT : theme.colors.info.DEFAULT
          }
        >
          <Text fontSize={12}>🛡️</Text>
          <Text
            variant="caption"
            color={isLow ? theme.colors.warning.dark : theme.colors.info.dark}
            fontWeight="600"
          >
            {usesRemaining}/{maxUses} saves
          </Text>
        </Box>
      </Pressable>
    </Animated.View>
  );
}

export default GraceUsesIndicator;
