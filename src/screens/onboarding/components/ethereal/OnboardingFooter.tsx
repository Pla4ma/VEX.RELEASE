/**
 * OnboardingFooter — sticky bottom bar with Continue button.
 * Positioned absolute at bottom with safe-area padding.
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

// Static layout shape for the footer row — safe to hoist (no theme/runtime deps).
const FOOTER_BASE_STYLE: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  paddingTop: 12,
  paddingHorizontal: 0,
  gap: 12,
};

// Static shape for the Continue button — only `paddingBottom`, `backgroundColor`,
// `opacity`, and `shadowOpacity` are dynamic per render; rest is hoisted.
const CONTINUE_BUTTON_BASE_STYLE: ViewStyle = {
  height: 60,
  width: '100%',
  paddingHorizontal: 32,
  borderRadius: 30,
  borderColor: etherealButton.googleBorder,
  borderWidth: 1,
  alignItems: 'center',
  justifyContent: 'center',
  shadowColor: etherealButton.buttonShadow,
  shadowOffset: { width: 0, height: 8 },
  shadowRadius: 18,
};

export function OnboardingFooter({
  isContinueDisabled,
  isFinishing,
  onContinue,
}: OnboardingFooterProps): React.JSX.Element | null {
  const insets = useSafeAreaInsets();
  if (isContinueDisabled && isFinishing) {
    return null;
  }

  const footerStyle: ViewStyle = {
    ...FOOTER_BASE_STYLE,
    paddingBottom: insets.bottom + 12,
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
          CONTINUE_BUTTON_BASE_STYLE,
          {
            backgroundColor: isContinueDisabled
              ? 'rgba(7, 31, 32, 0.34)'
              : etherealButton.googleFill,
            opacity: pressed ? 0.92 : 1,
            shadowOpacity: isContinueDisabled ? 0 : 0.38,
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
