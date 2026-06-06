import React from 'react';
import { Pressable, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import { buttonTap } from '../../../utils/haptics';
import { getMinTouchTargetStyle } from '../../../utils/touchTarget';
import { lightColors } from '@/theme/tokens/colors';
import { rgbaColors } from '@/theme/tokens/rgba-colors';
import { useButtonPressHandlers } from './VexPrimaryButton.hooks';

type VexActivationButtonProps = {
  label: string;
  loadingLabel: string;
  isLoading: boolean;
  onPress: () => void;
};

export function VexActivationButton({
  label,
  loadingLabel,
  isLoading,
  onPress,
}: VexActivationButtonProps): React.JSX.Element {
  const { theme } = useTheme();
  const { handlePressIn, handlePressOut } = useButtonPressHandlers(true);

  return (
    <View style={{ alignItems: 'center' }}>
      <Pressable
        accessibilityHint="Authenticates and opens your VEX workspace"
        accessibilityLabel={label}
        accessibilityRole="button"
        accessibilityState={{ busy: isLoading, disabled: isLoading }}
        disabled={isLoading}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => {
          buttonTap();
          onPress();
        }}
        style={({ pressed }) => [
          getMinTouchTargetStyle(),
          {
            borderRadius: theme.borderRadius['2xl'],
            overflow: 'hidden',
            opacity: isLoading ? 0.85 : pressed ? 0.94 : 1,
          },
        ]}
      >
        {/* Violet to orange gradient body */}
        <LinearGradient
          colors={[lightColors.accent.purple, lightColors.accent.purple, lightColors.semantic.warning, lightColors.accent.orange]}
          locations={[0, 0.35, 0.72, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            minHeight: 56,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: theme.spacing[6],
            shadowColor: lightColors.text.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          {/* Inner shadow — top */}
          <LinearGradient
            colors={[rgbaColors.rgb_0_0_0_0_14, rgbaColors.rgb_0_0_0_0]}
            locations={[0, 0.35]}
            pointerEvents="none"
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          />

          {/* Top shine line */}
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: 1,
              left: 40,
              right: 40,
              height: 1.5,
              backgroundColor: rgbaColors.rgb_255_255_255_0_45,
              borderRadius: 1,
            }}
          />

          {/* White text with crisp glow */}
          <Text
            color="semantic.liquidButtonText"
            fontSize={16}
            fontWeight="700"
            letterSpacing={0.3}
            textAlign="center"
            style={{
              textShadowColor: rgbaColors.rgb_255_255_255_0_3,
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 6,
            }}
          >
            {isLoading ? loadingLabel : `${label}  \u2192`}
          </Text>
        </LinearGradient>
      </Pressable>
    </View>
  );
}
