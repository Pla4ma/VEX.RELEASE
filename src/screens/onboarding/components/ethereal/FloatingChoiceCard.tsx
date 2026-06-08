/**
 * FloatingChoiceCard — glass choice card. Static (motion stripped for
 * performance). Used for onboarding step choices.
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
    borderRadius: 24,
    backgroundColor: selected ? etherealCard.fillSelected : etherealCard.fill,
    borderWidth: selected ? 1.5 : 1,
    borderColor: selected ? etherealCard.borderSelected : etherealCard.border,
    overflow: 'hidden',
    shadowColor: etherealGlass.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.85,
    shadowRadius: 28,
  };

  return (
    <View>
      <ShimmerSweep
        accessibilityHint={accessibilityHint ?? 'Select this option'}
        accessibilityLabel={title}
        backgroundColor={selected ? etherealCard.fillSelected : etherealCard.fill}
        borderColor={selected ? etherealCard.borderSelected : etherealCard.border}
        borderRadius={24}
        borderWidth={selected ? 1.5 : 1}
        disabled={disabled}
        height={undefined}
        onPress={onPress}
        selected={selected}
        style={surfaceStyle}
      >
        <SafeBlurView intensity={40} tint="light" style={{ flex: 1 }}>
          <View style={{ padding: 18, gap: 6 }}>
            <Text
              fontSize={17}
              fontWeight="700"
              style={{ color: etherealCard.title }}
            >
              {title}
            </Text>
            {body ? (
              <Text
                fontSize={14}
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
