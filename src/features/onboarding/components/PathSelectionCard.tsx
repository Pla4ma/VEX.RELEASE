import React from 'react';
import { Pressable, View } from 'react-native';
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
interface PathSelectionCardProps {
  path: OnboardingPath;
  isSelected: boolean;
  onPress: () => void;
  index: number;
}
export function PathSelectionCard({
  path,
  isSelected,
  onPress,
  index,
}: PathSelectionCardProps): React.ReactNode {
  const meta = PATH_METADATA[path];
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
    scale.value = withSpring(0.97, springPresets.tactile);
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, springPresets.tactile);
  };
  React.useEffect(() => {
    glow.value = withTiming(isSelected ? 0.3 : 0, { duration: 300 });
  }, [isSelected, glow]);
  return (
    <Animated.View            entering={FadeInUp.delay(index * 80).duration(400)}
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
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[4] }}>
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 18,
              backgroundColor: `${meta.accentColor}18`,
              alignItems: 'center',
              justifyContent: 'center',
            }}
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
              entering={FadeInUp}
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: meta.accentColor,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="check" size={16} color="#FFFFFF" />
            </Animated.View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}