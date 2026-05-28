/**
 * Live Focusing Widget — shows real-time focus session count,
 * friend/squad activity, and trend data.
 *
 * @phase 10.6
 */
import React from "react";
import { Pressable } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Box } from "../../../components/primitives/Box";
import { Text } from "../../../components/primitives/Text";
import { launchColors } from "@theme/tokens/launch-colors";
import type { LiveFocusingWidgetProps } from "./live-focusing/types";
import { useCountUp, formatNumber } from "./live-focusing/helpers";
import { PulsingLiveDot } from "./live-focusing/PulsingLiveDot";
import { AvatarStack } from "./live-focusing/AvatarStack";
import { TrendIndicator } from "./live-focusing/TrendIndicator";

export { LiveFocusingSkeleton } from "./live-focusing/LiveFocusingSkeleton";
export type { LiveFocusingData } from "./live-focusing/types";

export function LiveFocusingWidget({
  data,
  onPress,
  compact = false,
  isLoading: _isLoading = false,
}: LiveFocusingWidgetProps): JSX.Element {
  const animatedCount = useCountUp(data.totalCount);

  if (compact) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityLabel="Interactive control"
        accessibilityRole="button"
        accessibilityHint="Activates this control"
      >
        <Box
          flexDirection="row"
          alignItems="center"
          gap="md"
          p="md"
          borderRadius="lg"
          bg="background.secondary"
        >
          <PulsingLiveDot />
          <Box flex={1}>
            <Text variant="body" color="text.primary" fontWeight="600">
              {formatNumber(animatedCount)} people focusing
            </Text>
            <Text variant="caption" color="text.secondary">
              {data.friendsCount > 0 && `${data.friendsCount} friends • `}
              {data.squadCount > 0 && `${data.squadCount} squad `}
              Join them!
            </Text>
          </Box>
          <AvatarStack avatars={data.sampleAvatars} maxDisplay={3} />
        </Box>
      </Pressable>
    );
  }

  return (
    <Animated.View entering={FadeIn.duration(400)}>
      <Pressable
        onPress={onPress}
        accessibilityLabel="Interactive control"
        accessibilityRole="button"
        accessibilityHint="Activates this control"
      >
        <Box
          p="xl"
          borderRadius="xl"
          bg="background.secondary"
          borderWidth={1}
          borderColor="border.light"
          gap="lg"
          style={{
            shadowColor: launchColors.hex_000,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          {/* Header: live dot + trend */}
          <Box
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box flexDirection="row" alignItems="center" gap="sm">
              <PulsingLiveDot />
              <Text variant="caption" color="success.DEFAULT" fontWeight="600">
                LIVE NOW
              </Text>
            </Box>
            {data.trend && (
              <TrendIndicator trend={data.trend} percent={data.trendPercent} />
            )}
          </Box>

          {/* Main count */}
          <Box alignItems="center" gap="sm">
            <Box flexDirection="row" alignItems="center" gap="sm">
              <AvatarStack avatars={data.sampleAvatars} maxDisplay={4} />
            </Box>

            <Text
              fontSize={48}
              fontWeight="900"
              color="text.primary"
              textAlign="center"
            >
              {formatNumber(animatedCount)}
            </Text>

            <Text variant="h3" color="text.primary" textAlign="center">
              people focusing right now
            </Text>

            <Text variant="body" color="text.secondary" textAlign="center">
              You're not alone in this journey
            </Text>
          </Box>

          {/* Stats row */}
          <Box
            flexDirection="row"
            justifyContent="space-between"
            p="md"
            borderRadius="lg"
            bg="background.tertiary"
          >
            <Box alignItems="center">
              <Text fontSize={20} fontWeight="700" color="primary.500">
                {data.friendsCount}
              </Text>
              <Text variant="caption" color="text.tertiary">
                Friends
              </Text>
            </Box>

            <Box width={1} height={40} bg="border.light" />

            <Box alignItems="center">
              <Text fontSize={20} fontWeight="700" color="accent.purple">
                {data.squadCount}
              </Text>
              <Text variant="caption" color="text.tertiary">
                Squad
              </Text>
            </Box>

            <Box width={1} height={40} bg="border.light" />

            <Box alignItems="center">
              <Text fontSize={20} fontWeight="700" color="text.primary">
                {formatNumber(
                  data.totalCount - data.friendsCount - data.squadCount,
                )}
              </Text>
              <Text variant="caption" color="text.tertiary">
                Global
              </Text>
            </Box>
          </Box>

          {/* CTA */}
          <Box alignItems="center">
            <Text variant="caption" color="primary.500" fontWeight="600">
              Tap to see who's focusing →
            </Text>
          </Box>
        </Box>
      </Pressable>
    </Animated.View>
  );
}

export default LiveFocusingWidget;
