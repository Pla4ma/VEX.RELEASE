/**
 * EtherealAuthButtons — Apple, Google, and Email auth CTAs.
 * Static (motion stripped for performance).
 */
import React, { useCallback } from 'react';
import { View } from 'react-native';

import { Text } from '../../../../components/primitives/Text';
import { etherealButton } from '@/theme/tokens/ethereal-sky';
import { TapRipple } from './TapRipple';
import { AppleGlyph, EnvelopeGlyph, GoogleGlyph } from './AuthGlyphs';
import {
  StaggeredAuthButton,
  type StaggeredButtonSpec,
} from './StaggeredAuthButton';

export type EtherealAuthProvider = 'apple' | 'google' | 'email';

type EtherealAuthButtonsProps = {
  onProviderPress: (provider: EtherealAuthProvider) => void;
  disabled?: boolean;
  startDelayMs?: number;
  emailLabel?: string;
};

export function EtherealAuthButtons({
  onProviderPress,
  disabled = false,
  startDelayMs: _startDelayMs = 800,
  emailLabel = 'Continue with Email',
}: EtherealAuthButtonsProps): React.JSX.Element {
  const onEmailPress = useCallback(() => {
    onProviderPress('email');
  }, [onProviderPress]);

  const googleSpec: StaggeredButtonSpec = {
    provider: 'google',
    label: 'Continue with Google',
    fill: etherealButton.googleFill,
    textColor: etherealButton.googleText,
    borderColor: etherealButton.googleBorder,
    glyph: <GoogleGlyph />,
    accessibilityHint: 'Continues with Google sign in',
    useShimmer: true,
    useRipple: false,
  };

  const appleSpec: StaggeredButtonSpec = {
    provider: 'apple',
    label: 'Continue with Apple',
    fill: etherealButton.appleFill,
    textColor: etherealButton.appleText,
    glyph: <AppleGlyph color={etherealButton.appleText} />,
    accessibilityHint: 'Continues with Apple sign in',
    useShimmer: true,
    useRipple: false,
  };

  return (
    <View style={{ width: '100%', gap: 12 }}>
      <StaggeredAuthButton
        delay={0}
        disabled={disabled}
        onPress={() => onProviderPress('google')}
        spec={googleSpec}
      />
      <StaggeredAuthButton
        delay={0}
        disabled={disabled}
        onPress={() => onProviderPress('apple')}
        spec={appleSpec}
      />
      <View style={{ alignSelf: 'center', marginTop: 4 }}>
        <TapRipple
          accessibilityHint="Continues with email sign in"
          accessibilityLabel={emailLabel}
          backgroundColor="transparent"
          borderRadius={20}
          disabled={disabled}
          height={48}
          onPress={onEmailPress}
          rippleColor="rgba(10, 10, 10, 0.35)"
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              paddingHorizontal: 18,
            }}
          >
            <EnvelopeGlyph color={etherealButton.ghostText} />
            <Text
              fontSize={15}
              fontWeight="600"
              style={{
                color: etherealButton.ghostText,
                textDecorationLine: 'underline',
              }}
            >
              {emailLabel}
            </Text>
          </View>
        </TapRipple>
      </View>
    </View>
  );
}
