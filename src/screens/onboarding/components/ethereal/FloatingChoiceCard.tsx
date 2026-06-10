import React from 'react';
import { View, type ViewStyle } from 'react-native';

import { etherealCard, etherealGlass } from '@/theme/tokens/ethereal-sky';
import { vexLightGlass } from '@/theme/tokens/vex-light-glass';
import { Text } from '../../../../components/primitives/Text';
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
};

export function FloatingChoiceCard({
  title,
  body,
  selected = false,
  disabled = false,
  onPress,
  accessibilityHint,
  delayMs: _delayMs = 0,
  index: _index,
}: FloatingChoiceCardProps): React.JSX.Element {
  const surfaceStyle: ViewStyle = {
    borderRadius: 26,
    backgroundColor: selected ? etherealCard.fillSelected : etherealCard.fill,
    borderWidth: selected ? 2 : 1,
    borderColor: selected ? 'rgba(55,212,188,0.45)' : etherealCard.border,
    minHeight: 78,
    overflow: 'hidden',
    shadowColor: etherealGlass.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.65,
    shadowRadius: 18,
  };

  return (
    <View>
      {selected ? (
        <View
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 2,
            width: 22,
            height: 22,
            borderRadius: 11,
            backgroundColor: vexLightGlass.mint[500],
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text fontSize={12} fontWeight="800" style={{ color: '#FFFFFF' }}>
            ✓
          </Text>
        </View>
      ) : null}
      <ShimmerSweep
        accessibilityHint={accessibilityHint ?? 'Select this option'}
        accessibilityLabel={title}
        backgroundColor={selected ? etherealCard.fillSelected : etherealCard.fill}
        borderColor={selected ? 'rgba(55,212,188,0.45)' : etherealCard.border}
        borderRadius={26}
        borderWidth={selected ? 2 : 1}
        disabled={disabled}
        height={undefined}
        onPress={onPress}
        selected={selected}
        style={surfaceStyle}
      >
        <SafeBlurView intensity={40} tint="light" style={{ flex: 1 }}>
          <View style={{ padding: 16, gap: 4 }}>
            <Text
              fontSize={19}
              fontWeight="800"
              style={{ color: etherealCard.title }}
            >
              {title}
            </Text>
            {body ? (
              <Text
                fontSize={14}
                fontWeight="600"
                style={{ color: etherealCard.body, lineHeight: 20 }}
                numberOfLines={2}
              >
                {body}
              </Text>
            ) : null}
          </View>
        </SafeBlurView>
      </ShimmerSweep>
    </View>
  );
}
