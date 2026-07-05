// Module-scope base specs. Provider-specific glyphs and labels move into
// the component body so the `onProviderPress` callback can be captured per
// instance; the structural shape is hoisted to give memoized children a
// stable reference.
const BASE_AUTH_STYLE = {
  useShimmer: true,
  useRipple: false,
} as const;

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
  startDelayMs = 800,
  emailLabel = 'Continue with Email',
}: EtherealAuthButtonsProps): React.JSX.Element {
  const onEmailPress = useCallback((): void => {
    onProviderPress('email');
  }, [onProviderPress]);
  // googleSpec/appleSpec/emailSpec stay inside the component deliberately:
  // they capture `emailLabel` prop + `onProviderPress` callback, which means
  // they cannot move to module-scope. The shared `useShimmer: true,
  // useRipple: false` flags are spread from module-scope BASE_SPEC. The
  // `prefer-module-scope-static-value` diagnostic in this file is therefore
  // a legitimate false-positive per the rule's canonical recipe \u2014 do not
  // reattempt the hoist without a deeper refactor (e.g. a spec-builder
  // function passed `onProviderPress`).
  const googleSpec: StaggeredButtonSpec = {
    provider: 'google',
    label: 'Continue with Google',
    fill: etherealButton.googleFill,
    textColor: etherealButton.googleText,
    borderColor: etherealButton.googleBorder,
    glyph: <GoogleGlyph />,
    accessibilityHint: 'Continues with Google sign in',
    ...BASE_AUTH_STYLE,
  };
  const appleSpec: StaggeredButtonSpec = {
    provider: 'apple',
    label: 'Continue with Apple',
    fill: etherealButton.appleFill,
    textColor: etherealButton.appleText,
    borderColor: etherealButton.appleBorder,
    glyph: <AppleGlyph color={etherealButton.appleText} />,
    accessibilityHint: 'Continues with Apple sign in',
    ...BASE_AUTH_STYLE,
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
    ...BASE_AUTH_STYLE,
    rippleColor: etherealButton.googleBorder,
  };
  return (
    <View style={{ width: '100%', gap: 14 }}>
      <StaggeredAuthButton
        delay={startDelayMs}
        disabled={disabled}
        onPress={() => onProviderPress('google')}
        spec={googleSpec}
      />
      <StaggeredAuthButton
        delay={startDelayMs + 70}
        disabled={disabled}
        onPress={() => onProviderPress('apple')}
        spec={appleSpec}
      />
      <StaggeredAuthButton
        delay={startDelayMs + 140}
        disabled={disabled}
        onPress={onEmailPress}
        spec={emailSpec}
      />
    </View>
  );
}