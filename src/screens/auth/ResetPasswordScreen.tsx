import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';
/**
 * Reset Password Screen
 *
 * Password reset confirmation screen with new password input.
 */

import React, { useState, useCallback } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useTheme } from '../../theme';
import { Box, Text } from '../../components/primitives';
import { Button, Input } from '../../components';
import { Icon } from '../../icons';
import { resetPasswordSchema } from './schemas';
import type { AuthStackParams } from '../../navigation';

type Props = NativeStackScreenProps<AuthStackParams, 'ResetPassword'>;

export const ResetPasswordScreen: React.FC<Props> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { token: _token } = route.params;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = useCallback(async () => {
    setError('');

    const result = resetPasswordSchema.safeParse({ password, confirmPassword });
    if (!result.success) {
      setError(result.error.errors[0]?.message || 'Invalid input');
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 1500);
  }, [password, confirmPassword]);

  const handleLogin = useCallback(() => {
    navigation.navigate({ name: 'Login', params: {} });
  }, [navigation]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.background.primary }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={insets.top + 20}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingHorizontal: 24,
          paddingTop: 40,
          paddingBottom: insets.bottom + 20,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <Box alignItems="center" mb="xl">
          <Box
            width={80}
            height={80}
            borderRadius="xl"
            justifyContent="center"
            alignItems="center"
            style={{ backgroundColor: theme.colors.success.light }}
          >
            <Icon name="lock" size={32} color={theme.colors.success.DEFAULT} />
          </Box>
          <Text variant="h1" style={{ textAlign: 'center', marginTop: 24 }}>
            {isSuccess ? 'Password Reset!' : 'Create New Password'}
          </Text>
          <Text
            variant="body"
            color="text.secondary"
            style={{ textAlign: 'center', marginTop: 12 }}
          >
            {isSuccess
              ? 'Your password has been successfully reset'
              : 'Enter your new password below'}
          </Text>
        </Box>

        {/* Success State */}
        {isSuccess ? (
          <Box alignItems="center">
            <Box
              width={96}
              height={96}
              borderRadius="full"
              justifyContent="center"
              alignItems="center"
              style={{
                backgroundColor: theme.colors.success.light + '30',
                marginTop: 16,
              }}
            >
              <Icon
                name="check"
                size={48}
                color={theme.colors.success.DEFAULT}
              />
            </Box>
            <Button
              variant="primary"
              onPress={handleLogin}
              style={{ marginTop: 32 }}
              accessibilityLabel="Continue to login"
              accessibilityRole="button"
              accessibilityHint="Double tap to activate"
            >
              Continue to Login
            </Button>
          </Box>
        ) : (
          <>
            {/* Form */}
            <Box style={{ gap: 16 }}>
              <Input
                label="New Password"
                placeholder="Enter new password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                error={error}
                leftIcon="lock"
                editable={!isLoading}
              />

              <Input
                label="Confirm New Password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                leftIcon="lock"
                editable={!isLoading}
              />

              {/* Submit button */}
              <Button
                variant="primary"
                onPress={handleSubmit}
                isLoading={isLoading}
                disabled={isLoading || !password || !confirmPassword}
                style={{ marginTop: 8 }}
                accessibilityLabel="Reset password"
                accessibilityRole="button"
                accessibilityHint="Double tap to activate"
              >
                Reset Password
              </Button>
            </Box>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default withScreenErrorBoundary(ResetPasswordScreen, 'ResetPassword');
