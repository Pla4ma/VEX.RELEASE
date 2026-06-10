/**
 * FloatingChoiceCard — compact glass choice card for onboarding.
 */
import React from 'react';
import { View, type ViewStyle } from 'react-native';

import { etherealCard, etherealGlass } from '@/theme/tokens/ethereal-sky';
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
    borderRadius: 22,
    backgroundColor: selected ? etherealCard.fillSelected : etherealCard.fill,
    borderWidth: selected ? 1.6 : 1,
    borderColor: selected ? 'rgba(31, 137, 139, 0.72)' : etherealCard.border,
    minHeight: 82,
    overflow: 'hidden',
    shadowColor: etherealGlass.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.65,
    shadowRadius: 18,
  };

  return (
    <View>
      <ShimmerSweep
        accessibilityHint={accessibilityHint ?? 'Select this option'}
        accessibilityLabel={title}
        backgroundColor={selected ? etherealCard.fillSelected : etherealCard.fill}
        borderColor={selected ? etherealCard.borderSelected : etherealCard.border}
        borderRadius={22}
        borderWidth={selected ? 1.5 : 1}
        disabled={disabled}
        height={undefined}
        onPress={onPress}
        selected={selected}
        style={surfaceStyle}
      >
        <SafeBlurView intensity={40} tint="light" style={{ flex: 1 }}>
          <View style={{ padding: 16, gap: 4 }}>
            <Text
              fontSize={18}
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
