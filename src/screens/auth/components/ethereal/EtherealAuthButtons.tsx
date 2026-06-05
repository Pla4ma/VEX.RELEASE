/**
 * EtherealAuthButtons — Apple, Google, and Email auth CTAs.
 *
 * Orchestrates the staggered entrance of OAuth pill buttons + a
 * ghost "Continue with Email" link. Button rendering is in
 * AuthPillButton; glyphs in AuthGlyphs.
 */
import React, { useCallback } from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '../../../../components/primitives/Text';
import { etherealButton } from '@/theme/tokens/ethereal-sky';
import { getMinTouchTargetStyle } from '../../../../utils/touchTarget';
import { AppleGlyph, EnvelopeGlyph, GoogleGlyph } from './AuthGlyphs';
import { AuthPillButton, type AuthButtonSpec } from './AuthPillButton';

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
  const onEmailPress = useCallback(() => {
    onProviderPress('email');
  }, [onProviderPress]);

  const buttons: AuthButtonSpec[] = [
    {
      provider: 'google',
      label: 'Continue with Google',
      fill: etherealButton.googleFill,
      textColor: etherealButton.googleText,
      borderColor: etherealButton.googleBorder,
      glyph: <GoogleGlyph />,
      accessibilityHint: 'Continues with Google sign in',
    },
    {
      provider: 'apple',
      label: 'Continue with Apple',
      fill: etherealButton.appleFill,
      textColor: etherealButton.appleText,
      glyph: <AppleGlyph color={etherealButton.appleText} />,
      accessibilityHint: 'Continues with Apple sign in',
    },
  ];

  return (
    <View style={{ width: '100%', gap: 12 }}>
      {buttons.map((spec, i) => (
        <AuthPillButton
          key={spec.provider}
          delay={startDelayMs + i * 80}
          disabled={disabled}
          onPress={() => onProviderPress(spec.provider as EtherealAuthProvider)}
          spec={spec}
        />
      ))}
      <Pressable
        accessibilityHint="Continues with email sign in"
        accessibilityLabel={emailLabel}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onEmailPress}
        style={({ pressed }) => [
          {
            alignSelf: 'center',
            paddingVertical: 12,
            opacity: disabled ? 0.6 : pressed ? 0.7 : 1,
          },
          getMinTouchTargetStyle(),
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
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
      </Pressable>
    </View>
  );
}
