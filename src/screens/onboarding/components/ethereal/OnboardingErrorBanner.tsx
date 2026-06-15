/**
 * OnboardingErrorBanner — warm-toned error message with retry CTA.
 * Used for finishError display in the onboarding shell.
 */
import React from 'react';
import { View } from 'react-native';

import { Text } from '../../../../components/primitives/Text';
import { Button } from '../../../../components/primitives/Button';

type OnboardingErrorBannerProps = {
  message: string;
  onRetry: () => void;
};

export function OnboardingErrorBanner({
  message,
  onRetry,
}: OnboardingErrorBannerProps): React.JSX.Element {
  return (
    <View
      style={{
        marginVertical: 8,
        padding: 14,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 230, 200, 0.85)',
        borderWidth: 1,
        borderColor: 'rgba(180, 100, 40, 0.30)',
        gap: 8,
      }}
    >
      <Text fontSize={13} fontWeight="700" style={{ color: '#7A3E0F' }}>
        Setup status
      </Text>
      <Text
        fontSize={14}
        style={{ color: 'rgba(122, 62, 15, 0.92)', lineHeight: 20 }}
      >
        {message}
      </Text>
      <Button
        <Text>accessibilityLabel="Try finishing onboarding again"</Text>
        onPress={onRetry}
        variant="ghost"
      >
        Try again
      </Button>
    </View>
  );
}
