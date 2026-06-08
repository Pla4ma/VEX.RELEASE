/**
 * LoginEmailForm — the email + password form panel for the Login
 * screen. Pure presentation; receives form state + handlers from
 * the screen.
 */
import React from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '../../../../components/primitives/Text';
import { VexActivationButton } from '../VexPrimaryButton';
import { VexGlassInput } from '../VexGlassInput';
import { GlassSurface } from './GlassSurface';
import { getMinTouchTargetStyle } from '../../../../utils/touchTarget';
import { etherealText } from '@/theme/tokens/ethereal-sky';

type LoginEmailFormProps = {
  email: string;
  password: string;
  emailError?: string;
  passwordError?: string;
  isLoading: boolean;
  onChangeEmail: (value: string) => void;
  onChangePassword: (value: string) => void;
  onSubmit: () => void;
  onForgotPassword: () => void;
};

export function LoginEmailForm({
  email,
  password,
  emailError,
  passwordError,
  isLoading,
  onChangeEmail,
  onChangePassword,
  onSubmit,
  onForgotPassword,
}: LoginEmailFormProps): React.JSX.Element {
  return (
    <GlassSurface borderRadius={28} style={{ padding: 20, gap: 12 }}>
      <View style={{ gap: 10 }}>
        <VexGlassInput
          autoComplete="email"
          error={emailError}
          keyboardType="email-address"
          label="Email"
          onChangeText={onChangeEmail}
          placeholder="you@vex.app"
          returnKeyType="next"
          value={email}
        />
        <VexGlassInput
          autoComplete="current-password"
          error={passwordError}
          label="Password"
          onChangeText={onChangePassword}
          onSubmitEditing={onSubmit}
          placeholder="Enter password"
          returnKeyType="done"
          secureTextEntry
          value={password}
        />
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Pressable
          accessibilityHint="Opens password recovery"
          accessibilityLabel="Forgot password"
          accessibilityRole="link"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          onPress={onForgotPassword}
          style={getMinTouchTargetStyle()}
        >
          <Text
            color={etherealText.heading}
            fontSize={13}
            fontWeight="600"
            style={{ color: etherealText.subtitle }}
          >
            Forgot password?
          </Text>
        </Pressable>
      </View>
      <VexActivationButton
        isLoading={isLoading}
        label="Enter VEX"
        loadingLabel="Opening"
        onPress={onSubmit}
      />
    </GlassSurface>
  );
}
