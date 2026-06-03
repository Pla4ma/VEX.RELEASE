import React from 'react';
import { Pressable, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import { buttonTap } from '../../../utils/haptics';
import { getMinTouchTargetStyle } from '../../../utils/touchTarget';

type LiquidGlassCtaProps = {
  label: string;
  loadingLabel: string;
  isLoading: boolean;
  onPress: () => void;
};

export function LiquidGlassCta({
  label,
  loadingLabel,
  isLoading,
  onPress,
}: LiquidGlassCtaProps): React.JSX.Element {
  const { theme } = useTheme();
  const semantic = theme.colors.semantic;

  return (
    <Pressable
      accessibilityHint="Authenticates and opens your VEX workspace"
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ busy: isLoading, disabled: isLoading }}
      disabled={isLoading}
      onPress={() => {
        void buttonTap();
        onPress();
      }}
      style={({ pressed }) => [
        getMinTouchTargetStyle(),
        {
          borderRadius: theme.borderRadius['2xl'],
          overflow: 'hidden',
          opacity: pressed ? 0.92 : 1,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        },
      ]}
    >
      <LinearGradient
        colors={[semantic.liquidViolet, semantic.liquidOrange, semantic.liquidAmber]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          minHeight: 60,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: theme.spacing[5],
        }}
      >
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 1,
            left: theme.spacing[5],
            right: theme.spacing[5],
            height: 1,
            backgroundColor: semantic.liquidGlassHighlight,
          }}
        />
        <Text
          color="semantic.liquidButtonText"
          fontSize={14}
          fontWeight="800"
          letterSpacing={1.2}
          textTransform="uppercase"
        >
          {isLoading ? loadingLabel : `${label} ->`}
        </Text>
      </LinearGradient>
    </Pressable>
  );
}
