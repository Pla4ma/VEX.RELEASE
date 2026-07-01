import React, { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  useReducedMotion,
} from 'react-native-reanimated';
import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons/components/Icon';
import { useTheme } from '../../../theme/ThemeContext';
import { glow } from '../../../theme/tokens/elevation';
import { getMinTouchTargetStyle } from '../../../utils/touchTarget';
import type { TabItemProps } from './TabBar.types';
import { sizeConfig } from './TabBar.types';
import { styles } from './TabBar.styles';
import { getVariantStyles } from './TabBar.variants';

const TabItemComponent: React.ComponentType<TabItemProps> = ({
  item,
  isActive,
  onPress,
  onLayout,
  variant,
  size,
  showLabels,
}) => {
  const { theme } = useTheme();
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(isActive ? 1 : 0.7);

  useEffect(() => {
    opacity.value = withTiming(isActive ? 1 : item.disabled ? 0.4 : 0.7, {
      duration: 200,
    });
  }, [isActive, item.disabled, opacity]);

  const handlePressIn = () => {
    if (!item.disabled) {
      scale.value = withSpring(0.95, { damping: 15 });
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: reduceMotion ? 1 : scale.value }],
    opacity: reduceMotion ? (isActive ? 1 : 0.7) : opacity.value,
  }));

  const config = sizeConfig[size];
  const variantStyles = getVariantStyles(variant, isActive, theme);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={item.disabled}
      onLayout={onLayout}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive, disabled: item.disabled }}
      accessibilityLabel={item.label}
      accessibilityHint={item.disabled ? item.disabledReason : undefined}
      style={getMinTouchTargetStyle(undefined, showLabels ? undefined : 44)}
    >
      <Animated.View
        style={[
          styles.tabItem,
          {
            paddingVertical: config.paddingVertical,
            paddingHorizontal: config.paddingHorizontal,
          },
          variantStyles.container,
          animatedStyle,
        ]}
      >
        {item.icon ? (
          <View
            style={
              isActive
                ? glow(variantStyles.icon.color, 'whisper')
                : undefined
            }
          >
            <Icon
              name={item.icon}
              size={size === 'sm' ? 'sm' : 'md'}
              color={variantStyles.icon.color}
              variant={isActive ? 'solid' : 'outline'}
              style={showLabels ? styles.iconWithLabel : undefined}
            />
          </View>
        ) : null}

        {showLabels ? (
          <Text
            variant={size === 'sm' ? 'caption' : 'body'}
            style={[
              { fontSize: config.fontSize },
              variantStyles.text,
              { fontWeight: isActive ? '600' : '400' },
            ]}
          >
            {item.label}
          </Text>
        ) : null}

        {item.badge !== undefined ? (
          <View
            style={[
              styles.badge,
              { backgroundColor: theme.colors.error.DEFAULT },
              size === 'sm' ? styles.badgeSmall : undefined,
            ]}
          >
            <Text
              variant="caption"
              color="text.inverse"
              style={[
                styles.badgeText,
                size === 'sm' ? styles.badgeTextSmall : undefined,
              ]}
            >
              {typeof item.badge === 'number' && item.badge > 99
                ? '99+'
                : item.badge}
            </Text>
          </View>
        ) : null}

        {item.disabled ? (
          <View style={styles.disabledOverlay}>
            <Icon name="lock" size="sm" color={theme.colors.text.tertiary} />
          </View>
        ) : null}
      </Animated.View>
    </Pressable>
  );
};

export { TabItemComponent }