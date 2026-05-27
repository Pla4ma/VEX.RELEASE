import React, { useState } from "react";
import { Platform } from "react-native";
import Animated, {
  FadeIn,
  FadeInUp,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from "react-native-reanimated";
import { Box } from "../../../components/primitives/Box";
import { Button } from "../../../components/primitives/Button";
import { Text } from "../../../components/primitives/Text";
import { useTheme } from "../../../theme";
import { launchColors } from "@theme/tokens/launch-colors";
interface OnboardingPermissionsProps {
  onRequestPermission: () => Promise<boolean>;
  onContinue: () => void;
}
interface PermissionBenefit {
  icon: string;
  title: string;
  description: string;
}
const BENEFITS: PermissionBenefit[] = [
  {
    icon: "🔥",
    title: "Streak at Risk Alerts",
    description: "Get notified when your streak is about to break",
  },
  {
    icon: "👹",
    title: "Boss Spawn Alerts",
    description: "Never miss a boss encounter opportunity",
  },
  {
    icon: "⚔️",
    title: "Squad Challenges",
    description: "Get notified when squad wars start",
  },
];
function BenefitCard({
  benefit,
  index,
}: {
  benefit: PermissionBenefit;
  index: number;
}): JSX.Element {
  const { theme } = useTheme();
  return (
    <Animated.View entering={FadeInUp.delay(index * 100).duration(400)}>
      <Box
        flexDirection="row"
        alignItems="center"
        gap="md"
        p="md"
        borderRadius="xl"
        bg={theme.colors.background.secondary}
      >
        <Box
          width={48}
          height={48}
          borderRadius="lg"
          bg={`${theme.colors.primary[500]}15`}
          justifyContent="center"
          alignItems="center"
        >
          <Text fontSize={24}>{benefit.icon}</Text>
        </Box>

        <Box flex={1} gap="xs">
          <Text variant="body" color="text.primary" fontWeight="600">
            {benefit.title}
          </Text>
          <Text variant="caption" color="text.secondary">
            {benefit.description}
          </Text>
        </Box>
      </Box>
    </Animated.View>
  );
}
function SuccessAnimation(): JSX.Element {
  const scale = useSharedValue(0);
  React.useEffect(() => {
    scale.value = withSpring(1, { damping: 10, stiffness: 200 });
  }, [scale]);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return (
    <Animated.View style={animatedStyle}>
      <Box alignItems="center" gap="md">
        <Box
          width={80}
          height={80}
          borderRadius="full"
          bg={launchColors.hex_22c55e30}
          justifyContent="center"
          alignItems="center"
        >
          <Text fontSize={40}>✓</Text>
        </Box>
        <Text variant="h4" color="success.DEFAULT">
          All set!
        </Text>
      </Box>
    </Animated.View>
  );
}
export function OnboardingPermissions({
  onRequestPermission,
  onContinue,
}: OnboardingPermissionsProps): JSX.Element {
  const { theme } = useTheme();
  const [status, setStatus] = useState<
    "idle" | "requesting" | "granted" | "denied"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const handleRequest = async () => {
    setStatus("requesting");
    setError(null);
    try {
      const granted = await onRequestPermission();
      setStatus(granted ? "granted" : "denied");
    } catch (err) {
      setStatus("denied");
      setError("Could not request permission");
    }
  };
  return (
    <Box flex={1} justifyContent="space-between" px="xl" py="2xl">
      {}
      <Animated.View entering={FadeIn.duration(400)}>
        <Box gap="md" mt="xl">
          <Text fontSize={40}>🔔</Text>
          <Box gap="sm">
            <Text variant="h2" color="text.primary">
              Stay in the loop
            </Text>
            <Text variant="body" color="text.secondary">
              Enable notifications to never miss important moments.
            </Text>
          </Box>
        </Box>
      </Animated.View>

      {}
      <Box flex={1} justifyContent="center" gap="md">
        {status === "granted" ? (
          <SuccessAnimation />
        ) : (
          BENEFITS.map((benefit, index) => (
            <BenefitCard key={benefit.title} benefit={benefit} index={index} />
          ))
        )}
      </Box>

      {}
      <Animated.View entering={FadeInUp.delay(400).duration(400)}>
        <Box gap="md">
          {status === "idle" && (
            <Button
              size="lg"
              variant="primary"
              fullWidth
              onPress={handleRequest}
              isLoading={false}
              accessibilityLabel="Enable Notifications button"
              accessibilityRole="button"
              accessibilityHint="Activates this control"
            >
              Enable Notifications
            </Button>
          )}

          {status === "granted" && (
            <Button
              size="lg"
              variant="primary"
              fullWidth
              onPress={onContinue}
              accessibilityLabel="Continue button"
              accessibilityRole="button"
              accessibilityHint="Activates this control"
            >
              Continue
            </Button>
          )}

          {(status === "denied" || status === "idle") && (
            <Button
              size="lg"
              variant="ghost"
              fullWidth
              onPress={onContinue}
              accessibilityLabel="Action button"
              accessibilityRole="button"
              accessibilityHint="Activates this control"
            >
              {status === "denied"
                ? "Continue without notifications"
                : "Skip for now"}
            </Button>
          )}

          {status === "denied" && (
            <Text variant="caption" color="text.tertiary" textAlign="center">
              You can enable notifications later in Settings
            </Text>
          )}

          {error && (
            <Text variant="caption" color="error.DEFAULT" textAlign="center">
              {error}
            </Text>
          )}
        </Box>
      </Animated.View>
    </Box>
  );
}
export default OnboardingPermissions;
