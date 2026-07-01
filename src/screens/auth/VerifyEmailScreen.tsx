import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';
import React, { useState, useCallback, useEffect } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { Box } from '../../components/primitives/Box';
import { Text } from '../../components/primitives/Text';
import { Button } from '../../components/primitives/Button';
import { Input } from '../../components/Input';
import { Icon } from '../../icons/components/Icon';
import type { AuthStackParams, RootStackParams } from '../../navigation';
import type { NavigationProp } from '@react-navigation/native';
import { navigateToAuthScreen } from '../../navigation/navigation-helpers';
import { Text as VexText } from '../../components/primitives/Text';

type Props = NativeStackScreenProps<AuthStackParams, 'VerifyEmail'>;

const VerifyEmailScreen: React.ComponentType<Props> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { email } = route.params;

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
      return undefined;
    }
  }, [countdown]);

  const handleSubmit = useCallback(async () => {
    setError('');

    if (code.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 1500);
  }, [code]);

  const handleResend = useCallback(() => {
    setCanResend(false);
    setCountdown(60);
    // Simulate resend
  }, []);

  const handleContinue = useCallback(() => {
    navigateToAuthScreen(navigation as NavigationProp<RootStackParams>, 'Login', { email });
  }, [navigation, email]);

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
            style={{ backgroundColor: theme.colors.primary[50] }}
          >
            <Icon name="email" size={32} color={theme.colors.primary[500]} />
          </Box>
          <Text variant="h1" style={{ textAlign: 'center', marginTop: 24 }}>
            {isSuccess ? 'Email Verified!' : 'Verify Your Email'}
          </Text>
          <Text
            variant="body"
            color="text.secondary"
            style={{ textAlign: 'center', marginTop: 12 }}
          >
            {isSuccess
              ? 'Your email has been successfully verified'
              : `Enter the 6-digit code sent to ${email}`}
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
            <Button variant="primary"
              onPress={handleContinue}
              style={{ marginTop: 32 }}
              accessibilityLabel="Continue to login"
              accessibilityRole="button"
              accessibilityHint="Double tap to activate"
            >
              <VexText>Continue to Login</VexText>
            </Button>
          </Box>
        ) : (
          <>
            {/* Form */}
            <Box style={{ gap: 16 }}>
              <Input
                label="Verification Code"
                placeholder="Enter 6-digit code"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={6}
                error={error}
                leftIcon="shield"
                editable={!isLoading}
              />

              {/* Submit button */}
              <Button variant="primary"
                onPress={handleSubmit}
                isLoading={isLoading}
                disabled={isLoading || code.length !== 6}
                style={{ marginTop: 8 }}
                accessibilityLabel="Verify email"
                accessibilityRole="button"
                accessibilityHint="Double tap to activate"
              >
                <VexText>Verify Email</VexText>
              </Button>

              {/* Resend */}
              <Box alignItems="center" style={{ marginTop: 24 }}>
                {canResend ? (
                  <Button variant="ghost"
                    size="sm"
                    onPress={handleResend}
                    accessibilityLabel="Resend verification code"
                    accessibilityRole="button"
                    accessibilityHint="Double tap to activate"
                  >
                    <VexText>Resend Code</VexText>
                  </Button>
                ) : (
                  <Text variant="caption" color="text.tertiary">
                    Resend code in {countdown}s
                  </Text>
                )}
              </Box>
            </Box>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const VerifyEmailScreenWithBoundary = withScreenErrorBoundary(VerifyEmailScreen, 'VerifyEmail');
export { VerifyEmailScreenWithBoundary as VerifyEmailScreen };
