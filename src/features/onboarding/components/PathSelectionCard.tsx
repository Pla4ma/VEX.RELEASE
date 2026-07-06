import React from 'react';
import { Pressable, View, type ViewStyle } from 'react-native';
import Animated, {
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Icon } from '../../../icons/components/Icon';
import { Text } from '../../../components/primitives/Text';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import { springPresets } from '../../../theme/tokens/motion';
import { spacing } from '../../../theme/tokens/spacing';
import type { OnboardingPath } from '../onboarding-paths';
import { PATH_METADATA } from '../onboarding-paths';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
interface PathSelectionCardProps {
  path: OnboardingPath;
  isSelected: boolean;
  onPress: () => void;
  index: number;
}

// Static layout for the row container — `flex: 1`, `gap`, `flexDirection`,
// `alignItems` are stable; only the colour-fade is theme-dependent.
const PATH_ROW_STYLE: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: spacing[4],
};

// Static layout for the icon container — `width`, `height`, `borderRadius`,
// `alignItems`, `justifyContent` are stable; only `backgroundColor` varies
// per path accent color.
const PATH_ICON_CONTAINER_STYLE: ViewStyle = {
  width: 56,
  height: 56,
  borderRadius: 18,
  alignItems: 'center',
  justifyContent: 'center',
};

// Static layout for the selected-state check badge.
const PATH_CHECK_BADGE_STYLE: ViewStyle = {
  width: 28,
  height: 28,
  borderRadius: 14,
  alignItems: 'center',
  justifyContent: 'center',
};
export function PathSelectionCard({
  path,
  isSelected,
  onPress,
  index,
}: PathSelectionCardProps): React.ReactNode {
  const meta = PATH_METADATA[path];
  const { isReducedMotion } = useReducedMotion();
  const scale = useSharedValue(1);
  const glow = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderColor: isSelected
      ? meta.accentColor
      : vexLightGlass.glass.border,
    backgroundColor: isSelected
      ? `${meta.accentColor}14`
      : vexLightGlass.glass.fill,
    shadowOpacity: glow.value,
  }));
  const handlePressIn = () => {
    scale.value = isReducedMotion ? 0.97 : withSpring(0.97, springPresets.tactile);
  };
  const handlePressOut = () => {
    scale.value = isReducedMotion ? 1 : withSpring(1, springPresets.tactile);
  };
  React.useEffect(() => {
    glow.value = isReducedMotion
      ? (isSelected ? 0.3 : 0)
      : withTiming(isSelected ? 0.3 : 0, { duration: 300 });
  }, [isSelected, glow, isReducedMotion]);
  return (
    <Animated.View            entering={isReducedMotion ? undefined : FadeInUp.delay(index * 80).duration(400)}
      style={[
        {
          borderRadius: 24,
          borderWidth: 2,
          padding: spacing[4],
          marginBottom: spacing[3],
          boxShadow: `0px 8px 20px ${meta.accentColor}`,
        },
        animatedStyle,
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityLabel={meta.label}
        accessibilityRole="button"
        accessibilityHint={meta.description}
        accessibilityState={{ selected: isSelected }}
      >
        <View style={PATH_ROW_STYLE}>
          <View
            style={[
              PATH_ICON_CONTAINER_STYLE,
              { backgroundColor: `${meta.accentColor}18` },
            ]}
          >
            <Icon
              name={meta.icon}
              size={28}
              color={meta.accentColor}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              variant="h5"
              color={isSelected ? 'text.primary' : 'text.secondary'}
              style={{ fontWeight: '700' }}
            >
              {meta.label}
            </Text>
            <Text
              variant="bodySmall"
              color="text.tertiary"
              style={{ marginTop: spacing[1] }}
            >
              {meta.description}
            </Text>
          </View>
          {isSelected && (
            <Animated.View
              entering={isReducedMotion ? undefined : FadeInUp}
              style={[
                PATH_CHECK_BADGE_STYLE,
                { backgroundColor: meta.accentColor },
              ]}
            >
              <Icon name="check" size={16} color={vexLightGlass.text.inverse} />
            </Animated.View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}