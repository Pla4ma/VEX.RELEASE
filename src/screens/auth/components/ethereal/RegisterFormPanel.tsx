/**
 * RegisterFormPanel — the form section of the Register screen.
 * Pure presentation; receives form state + handlers.
 */
import React from 'react';
import { View } from 'react-native';

import { Text } from '../../../../components/primitives/Text';
import { FormField } from '../../../../shared/ui/components/FormField';
import { VexActivationButton } from '../VexPrimaryButton';
import { GlassSurface } from './GlassSurface';
import { etherealText } from '@/theme/tokens/ethereal-sky';

export type RegisterFields = {
  email: string;
  password: string;
  emailError?: string;
  passwordError?: string;
};

type RegisterFormPanelProps = {
  fields: RegisterFields;
  isLoading: boolean;
  onChangeEmail: (value: string) => void;
  onChangePassword: (value: string) => void;
  onSubmit: () => void;
};

export function RegisterFormPanel({
  fields,
  isLoading,
  onChangeEmail,
  onChangePassword,
  onSubmit,
}: RegisterFormPanelProps): React.JSX.Element {
  return (
    <View style={{ gap: 16 }}>
      <GlassSurface borderRadius={32} style={{ padding: 22, gap: 14, backgroundColor: 'rgba(255,255,255,0.88)' }}>
        <FormField
          accessibilityHint="Enter the email you want to use for VEX"
          accessibilityLabel="Account email"
          autoCapitalize="none"
          autoComplete="email"
          error={fields.emailError}
          keyboardType="email-address"
          label="Email"
          leftIcon="email"
          onChangeText={onChangeEmail}
          placeholder="you@example.com"
          returnKeyType="next"
          size="lg"
          value={fields.email}
        />
        <FormField
          accessibilityHint="Create a password for your VEX account"
          accessibilityLabel="Account password"
          autoComplete="new-password"
          error={fields.passwordError}
          helperText="Use 8+ characters with a number and symbol."
          label="Password"
          leftIcon="lock"
          onChangeText={onChangePassword}
          onSubmitEditing={onSubmit}
          placeholder="Create a password"
          returnKeyType="done"
          secureTextEntry
          size="lg"
          value={fields.password}
        />
        <Text
          color={etherealText.heading}
          variant="caption"
          style={{ color: etherealText.muted }}
        >
          By creating an account, you agree to the Terms of Service and
          Privacy Policy.
        </Text>
      </GlassSurface>
      <VexActivationButton
        isLoading={isLoading}
        label="Create account"
        loadingLabel="Creating"
        onPress={onSubmit}
      />
    </View>
  );
}
