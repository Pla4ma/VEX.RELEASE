import React, { useEffect } from 'react';
import { Pressable, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useReducedMotion,
  withSpring,
  FadeInUp,
  FadeOutUp,
} from 'react-native-reanimated';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import { triggerHaptic } from '../../../utils/haptics';
import {
  REWARD_CONFIG,
  getRewardColor,
  type RewardType,
} from './micro-reward-helpers';
import { RewardInnerContent } from './RewardInnerContent';

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
  const reducedMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const config = REWARD_CONFIG[type];
  const displayIcon = customIcon || config.icon;
  const displayLabel = customLabel || config.label;
  const displayColor = getRewardColor(type, theme);

  useEffect(() => { triggerHaptic('success'); }, []);

  useEffect(() => {
    if (!autoDismiss) {return;}
    const timer = setTimeout(() => onDismiss?.(), autoDismissDelay);
    return () => clearTimeout(timer);
  }, [autoDismiss, autoDismissDelay, onDismiss]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = reducedMotion ? 0.97 : withSpring(0.97, { damping: 15, stiffness: 300 });
  };
  const handlePressOut = () => {
    scale.value = reducedMotion ? 1 : withSpring(1, { damping: 15, stiffness: 300 });
  };
  const amountText = amount !== undefined ? `+${amount.toLocaleString()}` : null;

  const content = (
    <RewardInnerContent
      displayIcon={displayIcon}
      displayColor={displayColor}
      displayLabel={displayLabel}
      amountText={amountText}
      description={description}
      spacing={theme.spacing as unknown as Record<string, number>}
      textColors={{ primary: theme.colors.text.primary, secondary: theme.colors.text.secondary }}
    />
  );

  return (
    <Animated.View
      entering={reducedMotion ? undefined : FadeInUp.duration(300)}
      exiting={reducedMotion ? undefined : FadeOutUp.duration(200)}
      style={[{
        backgroundColor: theme.colors.background.secondary,
        borderRadius: theme.borderRadius.xl,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
        padding: theme.spacing[3],
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing[3],
        shadowColor: theme.colors.text.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
      }, style]}
    >
      <Animated.View style={[{ flex: 1, flexDirection: 'row', alignItems: 'center' }, animatedStyle]}>
        {onPress ? (
          <Pressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing[3], flex: 1 }}
            accessibilityLabel={displayLabel}
            accessibilityRole="button"
            accessibilityHint="View reward details"
          >{content}</Pressable>
        ) : content}
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
          <Text fontSize={16} color={theme.colors.text.tertiary}>✕</Text>
        </Pressable>
      )}
    </Animated.View>
  );
};

export { CompactRewardBadge, type CompactRewardBadgeProps } from './CompactRewardBadge';
export default MicroRewardBanner;
