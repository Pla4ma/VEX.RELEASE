import React from 'react';
import { Image, View, type ViewStyle } from 'react-native';
import { vexFire } from '../../../theme/tokens/vex-fire';

type LiquidGlassScreenProps = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export function LiquidGlassScreen({
  children,
  style,
}: LiquidGlassScreenProps): React.JSX.Element {
  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: vexFire.background,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Image
        accessibilityIgnoresInvertColors
        source={require('../../../../assets/vex/utility/notification-signal.png')}
        resizeMode="contain"
        style={{ height: 240, opacity: 0.1, position: 'absolute', right: -58, top: 20, width: 240 }}
      />
      {children}
    </View>
  );
}
