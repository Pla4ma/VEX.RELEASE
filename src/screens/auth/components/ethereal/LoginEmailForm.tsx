/**
 * LoginEmailForm — the email + password form panel for the Login
 * screen. Pure presentation; receives form state + handlers from
 * the screen.
 */
import React from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '../../../../components/primitives/Text';
import { Button } from '../../../../components/primitives/Button';
import { useTheme } from '../../../../theme/ThemeContext';
import { FormField } from '../../../../shared/ui/components/FormField';
import { getMinTouchTargetStyle } from '../../../../utils/touchTarget';

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
  const { theme } = useTheme();
  return (
    <View style={{ padding: theme.spacing[4], gap: theme.spacing[3],
      borderRadius: theme.borderRadius.xl, backgroundColor: theme.colors.surface.card }}>

      <View style={{ gap: theme.spacing[3] }}>
        <FormField
          accessibilityLabel="Email"
          accessibilityHint="Enter the email for your VEX account"
          autoCapitalize="none"
          autoComplete="email"
          error={emailError}
          keyboardType="email-address"
          label="Email"
          onChangeText={onChangeEmail}
          placeholder="you@vex.app"
          returnKeyType="next"
          value={email}
        />
        <FormField
          accessibilityLabel="Password"
          accessibilityHint="Enter your VEX account password"
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
          onPress={onForgotPassword}
          style={getMinTouchTargetStyle()}
        >
          <Text color="text.secondary" variant="bodySmall">Forgot password?</Text>
        </Pressable>
      </View>
      <Button accessibilityLabel="Enter VEX" accessibilityHint="Signs in to your VEX account"
        accessibilityRole="button" fullWidth isLoading={isLoading} onPress={onSubmit}>
        {isLoading ? 'Opening' : 'Enter VEX'}
      </Button>
    </View>
  );
}
