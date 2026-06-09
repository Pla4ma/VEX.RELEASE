/**
 * EtherealAuthButtons — Apple, Google, and Email auth CTAs.
 * Static (motion stripped for performance).
 */
import React, { useCallback } from 'react';
import { View } from 'react-native';

import { etherealButton } from '@/theme/tokens/ethereal-sky';
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
    borderColor: etherealButton.appleBorder,
    glyph: <AppleGlyph color={etherealButton.appleText} />,
    accessibilityHint: 'Continues with Apple sign in',
    useShimmer: true,
    useRipple: false,
  };

  const emailSpec: StaggeredButtonSpec = {
    provider: 'email',
    label: emailLabel,
    fill: etherealButton.emailFill,
    textColor: etherealButton.emailText,
    borderColor: etherealButton.emailBorder,
    borderWidth: 1.4,
    glyph: <EnvelopeGlyph color={etherealButton.emailText} />,
    accessibilityHint: 'Opens email sign in',
    useShimmer: true,
    useRipple: false,
    rippleColor: 'rgba(84, 163, 164, 0.20)',
  };

  return (
    <View style={{ width: '100%', gap: 14 }}>
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
      <StaggeredAuthButton
        delay={0}
        disabled={disabled}
        onPress={onEmailPress}
        spec={emailSpec}
      />
    </View>
  );
}
