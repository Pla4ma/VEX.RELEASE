import React from 'react';
import { Pressable, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated from 'react-native-reanimated';

import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { buttonTap } from '../../../utils/haptics';
import { getMinTouchTargetStyle } from '../../../utils/touchTarget';
import { lightColors } from '@/theme/tokens/colors';
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
  const { isReducedMotion } = useReducedMotion();
  const { handlePressIn, handlePressOut, animatedStyle, glowStyle, auraStyle } = useButtonPressHandlers(isReducedMotion);

  return (
    <View style={{ alignItems: 'center' }}>
      {/* Ambient pulse glow behind button */}
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            top: -24,
            bottom: -24,
            left: -24,
            right: -24,
            borderRadius: 9999,
            backgroundColor: 'rgba(255, 138, 36, 0.04)',
            shadowColor: lightColors.semantic.brandOrange,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 50,
          },
          auraStyle,
        ]}
      />

      {/* Orange glow beneath */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 6,
            bottom: -6,
            alignSelf: 'center',
            width: '80%',
            borderRadius: theme.borderRadius['2xl'],
            shadowColor: lightColors.semantic.brandOrange,
            shadowOffset: { width: 0, height: 8 },
            shadowRadius: 30,
          },
          glowStyle,
        ]}
      />

      <Animated.View
        style={[
          {
            borderRadius: theme.borderRadius['2xl'],
            shadowColor: lightColors.text.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 12,
            elevation: 8,
          },
          animatedStyle,
        ]}
      >
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
              opacity: isLoading ? 0.85 : 1,
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
            }}
          >
            {/* Inner shadow — top */}
            <LinearGradient
              colors={['rgba(0,0,0,0.14)', 'rgba(0,0,0,0)']}
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
                backgroundColor: 'rgba(255,255,255,0.45)',
                borderRadius: 1,
              }}
            />

            {/* Light sweep */}
            <Animated.View
              pointerEvents="none"
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                width: 60,
                backgroundColor: 'rgba(255,255,255,0.06)',
                transform: [{ skewX: '-25deg' }, { translateX: -120 }],
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
                textShadowColor: 'rgba(255, 255, 255, 0.30)',
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 6,
              }}
            >
              {isLoading ? loadingLabel : `${label}  \u2192`}
            </Text>
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </View>
  );
}
