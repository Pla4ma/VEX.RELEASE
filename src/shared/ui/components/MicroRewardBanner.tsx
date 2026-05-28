import React, { useEffect } from "react";
import { View, ViewStyle, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInUp,
  FadeOutUp,
} from "react-native-reanimated";
import { Text } from "../../../components/primitives/Text";
import { useTheme } from "../../../theme";
import { triggerHaptic } from "../../../utils/haptics";
import {
  REWARD_CONFIG,
  getRewardColor,
  type RewardType,
} from "./micro-reward-helpers";

export interface MicroRewardBannerProps {
  type: RewardType;
  amount?: number;
  label?: string;
  description?: string;
  icon?: string;
  onPress?: () => void;
  onDismiss?: () => void;
  autoDismiss?: boolean;
  autoDismissDelay?: number;
  style?: ViewStyle;
  showOnce?: boolean;
}

export const MicroRewardBanner: React.FC<MicroRewardBannerProps> = ({
  type,
  amount,
  label: customLabel,
  description,
  icon: customIcon,
  onPress,
  onDismiss,
  autoDismiss = false,
  autoDismissDelay = 3000,
  style,
}) => {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const config = REWARD_CONFIG[type];
  const displayIcon = customIcon || config.icon;
  const displayLabel = customLabel || config.label;
  const displayColor = getRewardColor(type, theme);
  useEffect(() => {
    void triggerHaptic("success");
  }, []);
  useEffect(() => {
    if (!autoDismiss) {
      return;
    }
    const timer = setTimeout(() => {
      onDismiss?.();
    }, autoDismissDelay);
    return () => clearTimeout(timer);
  }, [autoDismiss, autoDismissDelay, onDismiss]);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };
  const amountText =
    amount !== undefined ? `+${amount.toLocaleString()}` : null;

  const innerContent = (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing[3],
        flex: 1,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: `${displayColor}20`,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text fontSize={20}>{displayIcon}</Text>
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: theme.spacing[2],
          }}
        >
          <Text
            variant="bodySmall"
            color={theme.colors.text.primary}
            style={{ fontWeight: "700" }}
          >
            {displayLabel}
          </Text>
          {amountText && (
            <Text
              variant="bodySmall"
              color={displayColor}
              style={{ fontWeight: "800" }}
            >
              {amountText}
            </Text>
          )}
        </View>
        {description && (
          <Text variant="caption" color={theme.colors.text.secondary}>
            {description}
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <Animated.View
      entering={FadeInUp.duration(300)}
      exiting={FadeOutUp.duration(200)}
      style={[
        {
          backgroundColor: theme.colors.background.secondary,
          borderRadius: theme.borderRadius.xl,
          borderWidth: 1,
          borderColor: theme.colors.border.light,
          padding: theme.spacing[3],
          flexDirection: "row",
          alignItems: "center",
          gap: theme.spacing[3],
          shadowColor: theme.colors.text.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 3,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          { flex: 1, flexDirection: "row", alignItems: "center" },
          animatedStyle,
        ]}
      >
        {onPress ? (
          <Pressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: theme.spacing[3],
              flex: 1,
            }}
            accessibilityLabel={displayLabel}
            accessibilityRole="button"
            accessibilityHint="View reward details"
          >
            {innerContent}
          </Pressable>
        ) : (
          innerContent
        )}
      </Animated.View>

      {onDismiss && (
        <Pressable
          onPress={onDismiss}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={{ padding: theme.spacing[1] }}
          accessibilityLabel="Dismiss reward"
          accessibilityRole="button"
          accessibilityHint="Dismisses this reward notification"
        >
          <Text fontSize={16} color={theme.colors.text.tertiary}>
            ✕
          </Text>
        </Pressable>
      )}
    </Animated.View>
  );
};
export { CompactRewardBadge, type CompactRewardBadgeProps } from "./CompactRewardBadge";
export default MicroRewardBanner;
