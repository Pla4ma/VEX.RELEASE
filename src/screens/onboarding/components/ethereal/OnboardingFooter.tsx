/**
 * OnboardingFooter — bottom bar with the Continue button.
 * Pure presentation; receives disabled/loading state.
 */
import React from 'react';
import { Pressable, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '../../../../components/primitives/Text';
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
    paddingHorizontal: 24,
    gap: 12,
  };

  return (
    <View style={footerStyle}>
      <View style={{ flex: 1 }} />
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
            paddingHorizontal: 32,
            borderRadius: 28,
            backgroundColor: isContinueDisabled
              ? 'rgba(10, 10, 10, 0.30)'
              : '#0A0A0A',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.92 : 1,
          },
          getMinTouchTargetStyle(),
        ]}
      >
        <Text fontSize={16} fontWeight="700" style={{ color: '#FFFFFF' }}>
          {isFinishing ? '...' : 'Continue'}
        </Text>
      </Pressable>
    </View>
  );
}
