import React from 'react';
import { View } from 'react-native';

import { Text } from '../../../../components/primitives/Text';
import { etherealText } from '@/theme/tokens/ethereal-sky';
import { vexLightGlass } from '@/theme/tokens/vex-light-glass';

type CinematicSignalPillProps = {
  label: string;
};

export function CinematicSignalPill({
  label,
}: CinematicSignalPillProps): React.JSX.Element {
  return (
    <View
      style={{
        backgroundColor: vexLightGlass.glass.fillStrong,
        borderColor: vexLightGlass.glass.border,
        borderRadius: 999,
        borderWidth: 1,
        paddingHorizontal: 14,
        paddingVertical: 8,
      }}
    >
      <Text
        fontSize={12}
        fontWeight="800"
        style={{ color: etherealText.subtitle, letterSpacing: 1.2 }}
      >
        {label.toUpperCase()}
      </Text>
    </View>
  );
}
