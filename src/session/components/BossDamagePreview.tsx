import React, { useEffect } from "react";
import { Pressable } from "react-native";
import Animated, {
  FadeIn,
  FadeInUp,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Box } from "../../components/primitives/Box";
import { Text } from "../../components/primitives/Text";
import { useTheme } from "../../theme";
export interface BossDamagePreviewProps {
  bossName: string;
  currentHealthPercent: number;
  estimatedDamage: number;
  willDefeat: boolean;
  onPress?: () => void;
  isLoading?: boolean;
}
function BossDamageSkeleton(): JSX.Element {
  const { theme } = useTheme();
  return (
    <Box p="md" borderRadius="lg" bg={`${theme.colors.background.elevated}80`}>
      <Box flexDirection="row" alignItems="center" gap="md">
        <Box
          width={40}
          height={40}
          borderRadius="lg"
          bg={theme.colors.background.tertiary}
        />
        <Box gap="xs" flex={1}>
          <Box
            width={80}
            height={14}
            borderRadius="sm"
            bg={theme.colors.background.tertiary}
          />
          <Box
            width="100%"
            height={6}
            borderRadius="full"
            bg={theme.colors.background.tertiary}
          />
        </Box>
      </Box>
    </Box>
  );
}
function BossIcon({ willDefeat }: { willDefeat: boolean }): JSX.Element {
  const { theme } = useTheme();
  const scaleValue = useSharedValue(1);
  const rotateValue = useSharedValue(0);
  useEffect(() => {
    if (willDefeat) {
      scaleValue.value = withRepeat(
        withSequence(
          withSpring(1.3, { damping: 3, stiffness: 200 }),
          withSpring(1.1, { damping: 3, stiffness: 200 }),
        ),
        -1,
        true,
      );
      rotateValue.value = withRepeat(
        withSequence(
          withTiming(-5, { duration: 100 }),
          withTiming(5, { duration: 100 }),
        ),
        -1,
        true,
      );
    }
  }, [willDefeat, scaleValue, rotateValue]);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scaleValue.value },
      { rotate: `${rotateValue.value}deg` },
    ],
  }));
  return (
    <Animated.View style={animatedStyle}>
      <Box
        width={44}
        height={44}
        borderRadius="lg"
        bg={
          willDefeat
            ? `${theme.colors.success[500]}30`
            : theme.colors.background.tertiary
        }
        justifyContent="center"
        alignItems="center"
        borderWidth={willDefeat ? 2 : 1}
        borderColor={
          willDefeat ? theme.colors.success.DEFAULT : theme.colors.border.light
        }
      >
        <Text fontSize={24}>{willDefeat ? "⚔️" : "👹"}</Text>
      </Box>
    </Animated.View>
  );
}
function BossHealthBar({
  healthPercent,
  willDefeat,
}: {
  healthPercent: number;
  willDefeat: boolean;
}): JSX.Element {
  const { theme } = useTheme();
  const progressValue = useSharedValue(healthPercent / 100);
  useEffect(() => {
    progressValue.value = withSpring(healthPercent / 100, {
      damping: 15,
      stiffness: 100,
    });
  }, [healthPercent, progressValue]);
  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progressValue.value * 100}%`,
  }));
  const getHealthColor = () => {
    if (willDefeat) {
      return theme.colors.success.DEFAULT;
    }
    if (healthPercent <= 15) {
      return theme.colors.error.DEFAULT;
    }
    if (healthPercent <= 30) {
      return theme.colors.warning.DEFAULT;
    }
    if (healthPercent <= 50) {
      return theme.colors.accent.orange;
    }
    return theme.colors.error.DEFAULT;
  };
  return (
    <Box>
      <Box
        accessibilityLabel={`Boss health: ${healthPercent.toFixed(0)} percent`}
        accessibilityRole="progressbar"
        accessibilityValue={{
          min: 0,
          max: 100,
          now: Math.round(healthPercent),
          text: `${healthPercent.toFixed(0)} percent`,
        }}
        accessible
        height={6}
        borderRadius="full"
        bg={theme.colors.background.tertiary}
        overflow="hidden"
      >
        <Animated.View
          style={[
            {
              height: "100%",
              borderRadius: 3,
              backgroundColor: getHealthColor(),
            },
            animatedStyle,
          ]}
        />
      </Box>
      <Box flexDirection="row" justifyContent="space-between" mt="xs">
        <Text variant="caption" color="text.tertiary" fontSize={10}>
          {healthPercent.toFixed(0)}% health
        </Text>
        {willDefeat && (
          <Text
            variant="caption"
            color={theme.colors.success.DEFAULT}
            fontWeight="700"
            fontSize={10}
          >
            ⚡ DEFEAT!
          </Text>
        )}
      </Box>
    </Box>
  );
}
function DamageEstimate({
  damage,
  willDefeat,
}: {
  damage: number;
  willDefeat: boolean;
}): JSX.Element {
  const { theme } = useTheme();
  return (
    <Box flexDirection="row" alignItems="center" gap="xs" mt="xs">
      <Text fontSize={12}>⚔️</Text>
      <Text
        variant="caption"
        color={willDefeat ? theme.colors.success.DEFAULT : "text.secondary"}
        fontWeight={willDefeat ? "700" : "500"}
      >
        {willDefeat ? "DEFEATING BLOW: " : "This session: "}
        {damage} dmg
      </Text>
      {willDefeat && <Text fontSize={12}>🎉</Text>}
    </Box>
  );
}
function DefeatCelebration(): JSX.Element {
  const { theme } = useTheme();
  const bounceStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withRepeat(
          withSequence(
            withSpring(1.05, { damping: 2, stiffness: 150 }),
            withSpring(1, { damping: 2, stiffness: 150 }),
          ),
          -1,
          true,
        ),
      },
    ],
  }));
  return (
    <Animated.View entering={FadeInUp.duration(400)} style={bounceStyle}>
      <Box
        mt="sm"
        p="xs"
        borderRadius="md"
        bg={`${theme.colors.success[500]}30`}
        borderWidth={1}
        borderColor={theme.colors.success.DEFAULT}
      >
        <Text
          variant="caption"
          color={theme.colors.success.dark}
          fontWeight="700"
          textAlign="center"
        >
          🏆 This session will defeat the boss!
        </Text>
      </Box>
    </Animated.View>
  );
}
export function BossDamagePreview({
  bossName,
  currentHealthPercent,
  estimatedDamage,
  willDefeat,
  onPress,
  isLoading = false,
}: BossDamagePreviewProps): JSX.Element {
  const { theme } = useTheme();
  if (isLoading) {
    return <BossDamageSkeleton />;
  }
  const isNearDeath = currentHealthPercent <= 20 && !willDefeat;
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel="Interactive control"
      accessibilityRole="button"
      accessibilityHint="Activates this control"
    >
      <Animated.View entering={FadeIn.duration(400)}>
        <Box
          p="md"
          borderRadius="xl"
          bg={`${theme.colors.background.elevated}90`}
          borderWidth={isNearDeath || willDefeat ? 2 : 1}
          borderColor={
            willDefeat
              ? theme.colors.success.DEFAULT
              : isNearDeath
                ? theme.colors.warning.DEFAULT
                : theme.colors.border.DEFAULT
          }
        >
          <Box flexDirection="row" alignItems="center" gap="md">
            {}
            <BossIcon willDefeat={willDefeat} />

            {}
            <Box flex={1} gap="xs">
              <Box flexDirection="row" alignItems="center" gap="sm">
                <Text
                  variant="body"
                  color="text.primary"
                  fontWeight="600"
                  numberOfLines={1}
                >
                  {bossName}
                </Text>
              </Box>

              {}
              <BossHealthBar
                healthPercent={currentHealthPercent}
                willDefeat={willDefeat}
              />

              {}
              <DamageEstimate
                damage={estimatedDamage}
                willDefeat={willDefeat}
              />
            </Box>
          </Box>

          {}
          {willDefeat && <DefeatCelebration />}
        </Box>
      </Animated.View>
    </Pressable>
  );
}
export default BossDamagePreview;
