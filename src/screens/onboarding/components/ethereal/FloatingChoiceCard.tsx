import React from 'react';
import { View, type ViewStyle } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { etherealCard, etherealGlass } from '@/theme/tokens/ethereal-sky';
import { vexLightGlass } from '@/theme/tokens/vex-light-glass';
import { Text } from '../../../../components/primitives/Text';
import { useReducedMotion } from '../../../../hooks/useReducedMotion';
import { SafeBlurView } from '../../../../screens/auth/components/SafeBlurView';
import { ShimmerSweep } from '../../../../screens/auth/components/ethereal/ShimmerSweep';

type FloatingChoiceCardProps = {
  title: string;
  body?: string;
  selected?: boolean;
  disabled?: boolean;
  onPress: () => void;
  accessibilityHint?: string;
  delayMs?: number;
  index: number;
  layout?: 'list' | 'grid';
};

        
export function FloatingChoiceCard({
  title,
  body,
  selected = false,
  disabled = false,
  onPress,
  accessibilityHint,
  delayMs = 0,
  index,
  layout: _layout = 'list',
}: FloatingChoiceCardProps): React.JSX.Element {
  const { isReducedMotion } = useReducedMotion();
  const surfaceStyle: ViewStyle = {
    borderRadius: 23,
    backgroundColor: selected ? etherealCard.fillSelected : etherealCard.fill,
    borderWidth: selected ? 2 : 1,
    borderColor: selected ? 'rgba(55,212,188,0.45)' : etherealCard.border,
    minHeight: 68,
    overflow: 'hidden',
    shadowColor: etherealGlass.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.65,
    shadowRadius: selected ? 22 : 12,
    transform: [{ scale: selected ? 1.015 : 1 }],
  };

  return (
    <Animated.View
      entering={
        isReducedMotion ? undefined : FadeInUp.duration(280).delay(delayMs + index * 55)
      }
      style={{ width: '100%' }}
    >
      {selected ? (
        <View
          style={{}}
        >
          <Text fontSize={12} fontWeight="800" style={{ color: vexLightGlass.text.inverse }}>
            ✓
          </Text>
        </View>
      ) : null}
      <ShimmerSweep
        accessibilityHint={accessibilityHint ?? 'Select this option'}
        accessibilityLabel={title}
        backgroundColor={selected ? etherealCard.fillSelected : etherealCard.fill}
        borderColor={selected ? 'rgba(55,212,188,0.45)' : etherealCard.border}
        borderRadius={23}
        borderWidth={selected ? 2 : 1}
        disabled={disabled}
        height={undefined}
        onPress={onPress}
        selected={selected}
        style={surfaceStyle}
      >
        <SafeBlurView intensity={40} tint="light" style={{ flex: 1 }}>
          <View style={{ paddingHorizontal: 16, paddingVertical: 12, gap: 2 }}>
            <Text
              fontSize={18}
              fontWeight="800"
              style={{ color: etherealCard.title }}
              numberOfLines={1}
            >
              {title}
            </Text>
            {body ? (
              <Text
                fontSize={13}
                fontWeight="600"
                style={{ color: etherealCard.body, lineHeight: 18 }}
                numberOfLines={1}
              >
                {body}
              </Text>
            ) : null}
          </View>
        </SafeBlurView>
      </ShimmerSweep>
    </Animated.View>
  );
}
