/**
 * OnboardingHeader — the back button + eyebrow row at the top of
 * each onboarding step. Pure presentation.
 */
import React from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '../../../../components/primitives/Text';
import { getMinTouchTargetStyle } from '../../../../utils/touchTarget';

type OnboardingHeaderProps = {
  showBack: boolean;
  eyebrow?: string;
  onBack: () => void;
};

export function OnboardingHeader({
  showBack,
  eyebrow,
  onBack,
}: OnboardingHeaderProps): React.JSX.Element {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
      }}
    >
      <View style={{ minHeight: 44, justifyContent: 'center' }}>
        {showBack ? (
          <Pressable
            accessibilityHint="Returns to the previous onboarding step"
            accessibilityLabel="Back"
            accessibilityRole="button"
            onPress={onBack}
            style={getMinTouchTargetStyle()}
          >
            <Text
              fontSize={14}
              fontWeight="600"
              style={{ color: 'rgba(10, 10, 10, 0.78)' }}
            >
              {'\u2190'} Back
            </Text>
          </Pressable>
        ) : null}
      </View>
        {eyebrow ? (
          <Text
            fontSize={13}
            fontWeight="700"
            style={{ color: 'rgba(10, 10, 10, 0.55)', letterSpacing: 3 }}
          >
            {eyebrow}
          </Text>
        ) : (
          <View />
        )}
    </View>
  );
}
