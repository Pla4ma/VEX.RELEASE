/**
 * OnboardingFooter — bottom bar with the Continue button.
 * Pure presentation; receives disabled/loading state.
 */
import React from 'react';
import { Pressable, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '../../../../components/primitives/Text';
import { etherealButton } from '@/theme/tokens/ethereal-sky';
import { getMinTouchTargetStyle } from '../../../../utils/touchTarget';

type OnboardingFooterProps = {
  isContinueDisabled: boolean;
  isFinishing: boolean;
  onContinue: () => void;
};

export function OnboardingFooter({
  isContinueDisabled,
  isFinishing,
  onContinue,
}: OnboardingFooterProps): React.JSX.Element | null {
  const insets = useSafeAreaInsets();
  if (isContinueDisabled && isFinishing) {return null;}

  const footerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingBottom: insets.bottom + 12,
    paddingHorizontal: 40,
    gap: 12,
  };

  return (
    <View style={footerStyle}>
      <Pressable
        accessibilityHint="Continues to the next onboarding step"
        accessibilityLabel="Continue"
        accessibilityRole="button"
        accessibilityState={{ disabled: isContinueDisabled }}
        disabled={isContinueDisabled}
        onPress={onContinue}
        style={({ pressed }) => [
          {
            height: 56,
            width: '100%',
            paddingHorizontal: 32,
            borderRadius: 28,
            backgroundColor: isContinueDisabled
              ? 'rgba(7, 31, 32, 0.34)'
              : etherealButton.googleFill,
            borderColor: etherealButton.googleBorder,
            borderWidth: 1,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.92 : 1,
            shadowColor: etherealButton.buttonShadow,
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: isContinueDisabled ? 0 : 0.38,
            shadowRadius: 22,
          },
          getMinTouchTargetStyle(),
        ]}
      >
        <Text fontSize={16} fontWeight="700" style={{ color: etherealButton.googleText }}>
          {isFinishing ? '...' : 'Continue'}
        </Text>
      </Pressable>
    </View>
  );
}
