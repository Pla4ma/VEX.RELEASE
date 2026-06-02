import React from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import { Icon } from '../../../icons';
import { ELEMENT_THEMES } from '../../../features/companion/types';

import type { ElementInfo } from './elementData';
import { ElementVisual } from './ElementVisual';

interface ElementCardProps {
  element: ElementInfo;
  isSelected: boolean;
  onSelect: () => void;
  delay: number;
}

export function ElementCard({
  element,
  isSelected,
  onSelect,
  delay,
}: ElementCardProps): JSX.Element {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const themeColors = ELEMENT_THEMES[element.id];
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 200 });
  };
  return (
    <Animated.View
      entering={FadeInUp.duration(400).delay(delay)}
      style={{ width: '48%' }}
    >
      <Pressable
        onPress={onSelect}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{ width: '100%' }}
        accessibilityLabel="Element option"
        accessibilityRole="button"
        accessibilityHint="Double tap to activate"
      >
        <Animated.View
          style={[
            {
              padding: theme.spacing[4],
              borderRadius: 16,
              backgroundColor: isSelected
                ? `${themeColors.primary}20`
                : theme.colors.background.secondary,
              borderWidth: 2,
              borderColor: isSelected
                ? themeColors.primary
                : `${themeColors.primary}30`,
              minHeight: 160,
            },
            animatedStyle,
          ]}
        >
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: `${themeColors.primary}25`,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: theme.spacing[3],
              shadowColor: themeColors.glow,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: isSelected ? 0.5 : 0.2,
              shadowRadius: isSelected ? 10 : 4,
            }}
          >
            <ElementVisual element={element.id} color={themeColors.primary} />
          </View>

          <Text
            variant="h4"
            color={isSelected ? themeColors.primary : 'text.primary'}
            style={{ marginBottom: theme.spacing[1] }}
          >
            {element.name}
          </Text>

          <Text
            variant="caption"
            color="text.tertiary"
            style={{ marginBottom: theme.spacing[2] }}
          >
            {element.tagline}
          </Text>

          <View
            style={{
              paddingHorizontal: theme.spacing[2],
              paddingVertical: theme.spacing[1],
              borderRadius: 8,
              backgroundColor: `${themeColors.glow}20`,
              alignSelf: 'flex-start',
            }}
          >
            <Text variant="caption" color={themeColors.glow} fontWeight="600">
              {element.effect}
            </Text>
          </View>

          {isSelected && (
            <View
              style={{
                position: 'absolute',
                top: theme.spacing[3],
                right: theme.spacing[3],
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: themeColors.primary,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Icon name="check" size={14} color="#fff" variant="solid" />
            </View>
          )}
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}
