import React from "react";
import { Pressable } from "react-native";
import { Box } from "../../../components/primitives/Box";
import { Text } from "../../../components/primitives/Text";
import { useTheme } from "../../../theme";
import type { ChallengeItem } from "./todays-challenges-types";

export function ChallengeProgressRow({
  challenge,
  onClaim,
}: {
  challenge: ChallengeItem;
  onClaim?: (id: string) => void;
}): JSX.Element {
  const { theme } = useTheme();
  const progressPercent = Math.min(
    100,
    (challenge.currentProgress / challenge.targetProgress) * 100,
  );
  const getRewardIcon = () => {
    switch (challenge.rewardType) {
      case "XP":
        return "⭐";
      case "GEMS":
        return "💎";
      case "COINS":
        return "🪙";
      default:
        return "🎁";
    }
  };
  return (
    <Box gap="xs">
      {/* Title and reward */}
      <Box
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Text
          variant="bodySmall"
          color={challenge.isCompleted ? "success.DEFAULT" : "text.primary"}
          fontWeight={challenge.isCompleted ? "600" : "400"}
          style={
            challenge.isClaimed
              ? { textDecorationLine: "line-through", opacity: 0.6 }
              : undefined
          }
        >
          {challenge.isCompleted ? "✓ " : ""}
          {challenge.title}
        </Text>
        <Box flexDirection="row" alignItems="center" gap="xs">
          <Text fontSize={12}>{getRewardIcon()}</Text>
          <Text variant="caption" color="text.secondary">
            {challenge.rewardAmount}
          </Text>
        </Box>
      </Box>
      {/* Progress bar */}
      <Box
        height={6}
        borderRadius="full"
        bg={theme.colors.background.tertiary}
        overflow="hidden"
      >
        <Box
          height="100%"
          width={`${progressPercent}%`}
          borderRadius="full"
          bg={
            challenge.isCompleted
              ? theme.colors.success.DEFAULT
              : theme.colors.primary[500]
          }
        />
      </Box>
      {/* Progress text and claim button */}
      <Box
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Text variant="caption" color="text.tertiary">
          {challenge.currentProgress}/{challenge.targetProgress}
          {challenge.isCompleted && !challenge.isClaimed && (
            <Text variant="caption" color="success.DEFAULT" fontWeight="600">
              {" "}
              · Ready to claim!
            </Text>
          )}
        </Text>
        {challenge.isCompleted && !challenge.isClaimed && onClaim && (
          <Pressable
            onPress={() => onClaim(challenge.id)}
            accessibilityLabel="Claim button"
            accessibilityRole="button"
            accessibilityHint="Double tap to activate"
          >
            <Box
              px="sm"
              py="xs"
              borderRadius="full"
              bg={theme.colors.success[500]}
            >
              <Text
                variant="caption"
                color={theme.colors.text.inverse}
                fontWeight="600"
              >
                Claim
              </Text>
            </Box>
          </Pressable>
        )}
      </Box>
    </Box>
  );
}
