import React from 'react';
import { Pressable } from 'react-native';
import { Text } from '../../../../components/primitives/Text';
import { etherealButton, etherealText } from '@/theme/tokens/ethereal-sky';
import { getMinTouchTargetStyle } from '../../../../utils/touchTarget';

interface GuideActionProps {
  label: string;
  onPress: () => void;
  strong?: boolean;
}

export function GuideAction({
  label,
  onPress,
  strong = false,
}: GuideActionProps): React.JSX.Element {
  return (
    <Pressable
      accessibilityHint={`Activates ${label}`}
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        getMinTouchTargetStyle(),
        {
          opacity: pressed ? 0.72 : 1,
          paddingHorizontal: 4,
          justifyContent: 'center',
        },
      ]}
    >
      <Text
        fontSize={12}
        fontWeight="800"
        style={{ color: strong ? etherealButton.emailText : etherealText.heading }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
