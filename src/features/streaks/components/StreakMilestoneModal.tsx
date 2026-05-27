import React, { useEffect } from "react";
import { Modal, ScrollView, Dimensions } from "react-native";
import Animated, {
  FadeIn,
  FadeInUp,
  FadeOut,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withRepeat,
  withDelay,
  runOnJS,
} from "react-native-reanimated";
import { Box } from "../../../components/primitives/Box";
import { Text } from "../../../components/primitives/Text";
import { Button } from "../../../components/primitives/Button";
import { useTheme } from "../../../theme";
import { launchColors } from "@theme/tokens/launch-colors";
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
export interface StreakMilestoneModalProps {
  visible: boolean;
  milestone: number;
  rewards: { coins: number; gems?: number; exclusiveItem?: string };
  onDismiss: () => void;
  onShare?: () => void;
}
function ConfettiPiece({
  index,
  color,
}: {
  index: number;
  color: string;
}): JSX.Element {
  const startX = Math.random() * SCREEN_WIDTH;
  const endX = startX + (Math.random() - 0.5) * 200;
  const duration = 2000 + Math.random() * 1000;
  const pieceStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: withTiming(endX, { duration }) },
      { translateY: withTiming(SCREEN_HEIGHT + 50, { duration }) },
      { rotate: withTiming(`${Math.random() * 720}deg`, { duration }) },
    ],
  }));
  return (
    <Animated.View
      entering={FadeIn.duration(100).delay(index * 50)}
      style={[
        {
          position: "absolute",
          left: startX,
          top: -20,
          width: 10,
          height: 10,
          backgroundColor: color,
          borderRadius: 2,
        },
        pieceStyle,
      ]}
    />
  );
}
function ConfettiBurst({ count = 50 }: { count?: number }): JSX.Element {
  const colors = [
    launchColors.hex_ef4444,
    launchColors.hex_22c55e,
    launchColors.hex_3b82f6,
    launchColors.hex_f59e0b,
    launchColors.hex_a855f7,
    launchColors.hex_ec4899,
  ];
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <ConfettiPiece key={i} index={i} color={colors[i % colors.length]!} />
      ))}
    </>
  );
}
function StreakFlame({ days }: { days: number }): JSX.Element {
  const flameStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withRepeat(
          withSequence(
            withSpring(1.1, { damping: 3, stiffness: 100 }),
            withSpring(1, { damping: 3, stiffness: 100 }),
          ),
          -1,
          true,
        ),
      },
    ],
  }));
  const getFlameSize = () => {
    if (days >= 100) {
      return 80;
    }
    if (days >= 60) {
      return 70;
    }
    if (days >= 30) {
      return 60;
    }
    return 50;
  };
  const getFlameColor = () => {
    if (days >= 100) {
      return launchColors.hex_f59e0b;
    }
    if (days >= 60) {
      return launchColors.hex_a855f7;
    }
    if (days >= 30) {
      return launchColors.hex_3b82f6;
    }
    return launchColors.hex_ef4444;
  };
  const size = getFlameSize();
  return (
    <Animated.View
      style={[
        {
          width: size * 2,
          height: size * 2,
          borderRadius: size,
          backgroundColor: `${getFlameColor()}30`,
          justifyContent: "center",
          alignItems: "center",
          borderWidth: 3,
          borderColor: getFlameColor(),
        },
        flameStyle,
      ]}
    >
      <Text fontSize={size}>🔥</Text>
    </Animated.View>
  );
}
function RewardItem({
  emoji,
  value,
  label,
  isNew = false,
}: {
  emoji: string;
  value: string;
  label: string;
  isNew?: boolean;
}): JSX.Element {
  return (
    <Box alignItems="center" gap="xs">
      <Box position="relative">
        <Text fontSize={40}>{emoji}</Text>
        {isNew && (
          <Box
            position="absolute"
            top={-8}
            right={-16}
            px="xs"
            py="xs"
            borderRadius="full"
            bg="success.DEFAULT"
          >
            <Text
              variant="caption"
              color="text.inverse"
              fontWeight="700"
              fontSize={10}
            >
              NEW
            </Text>
          </Box>
        )}
      </Box>
      <Text variant="h3" color="text.primary" fontWeight="700">
        {value}
      </Text>
      <Text variant="caption" color="text.tertiary">
        {label}
      </Text>
    </Box>
  );
}
export function StreakMilestoneModal({
  visible,
  milestone,
  rewards,
  onDismiss,
  onShare,
}: StreakMilestoneModalProps): JSX.Element {
  const { theme } = useTheme();
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {}, 5000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [visible]);
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <Box
        flex={1}
        bg={`${theme.colors.background.primary}F0`}
        justifyContent="center"
      >
        <ScrollView
          contentContainerStyle={{ padding: 20, minHeight: SCREEN_HEIGHT }}
          showsVerticalScrollIndicator={false}
        >
          {}
          <ConfettiBurst count={60} />

          <Box
            flex={1}
            justifyContent="center"
            alignItems="center"
            py="xl"
            gap="xl"
          >
            {}
            <Animated.View entering={FadeInUp.duration(600).delay(200)}>
              <Box alignItems="center" gap="sm">
                <Text variant="label" color="accent.orange">
                  🔥 MILESTONE REACHED
                </Text>
                <Box alignItems="center" gap="md">
                  <StreakFlame days={milestone} />
                  <Text
                    variant="hero"
                    color="text.primary"
                    fontWeight="900"
                    textAlign="center"
                  >
                    {milestone}-Day Streak!
                  </Text>
                </Box>
              </Box>
            </Animated.View>

            {}
            <Animated.View
              entering={FadeInUp.duration(500).delay(800)}
              style={{ width: "100%" }}
            >
              <Box
                p="xl"
                borderRadius="2xl"
                bg="background.secondary"
                borderWidth={2}
                borderColor="accent.orange"
                gap="lg"
              >
                <Text variant="h4" color="text.primary" textAlign="center">
                  Rewards Unlocked
                </Text>

                <Box
                  flexDirection="row"
                  justifyContent="space-around"
                  flexWrap="wrap"
                  gap="md"
                >
                  <RewardItem
                    emoji="🪙"
                    value={`+${rewards.coins}`}
                    label="Coins"
                  />
                  {rewards.gems && (
                    <RewardItem
                      emoji="💎"
                      value={`+${rewards.gems}`}
                      label="Gems"
                    />
                  )}
                  {rewards.exclusiveItem && (
                    <RewardItem
                      emoji="🎁"
                      value={rewards.exclusiveItem}
                      label="Exclusive Item"
                      isNew
                    />
                  )}
                </Box>
              </Box>
            </Animated.View>

            {}
            <Animated.View entering={FadeInUp.duration(500).delay(1200)}>
              <Box alignItems="center" gap="sm">
                <Text variant="body" color="text.secondary" textAlign="center">
                  {milestone >= 100
                    ? "LEGENDARY! Few achieve this level of focus."
                    : milestone >= 30
                      ? "Incredible dedication! You're unstoppable."
                      : milestone >= 7
                        ? "A full week of focus! Keep the momentum."
                        : "Great start! Your streak is growing."}
                </Text>
              </Box>
            </Animated.View>

            {}
            <Animated.View
              entering={FadeInUp.duration(500).delay(1400)}
              style={{ width: "100%", marginTop: 20 }}
            >
              <Box gap="md">
                {onShare && (
                  <Button
                    variant="secondary"
                    size="lg"
                    fullWidth
                    onPress={onShare}
                    accessibilityLabel="-day streak`} button"
                    accessibilityRole="button"
                    accessibilityHint="Activates this control"
                  >
                    {`📤 Share my ${milestone}-day streak`}
                  </Button>
                )}
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onPress={onDismiss}
                  accessibilityLabel="Continue → button"
                  accessibilityRole="button"
                  accessibilityHint="Activates this control"
                >
                  Continue →
                </Button>
              </Box>
            </Animated.View>
          </Box>
        </ScrollView>
      </Box>
    </Modal>
  );
}
export default StreakMilestoneModal;
