/**
 * Login Screen
 *
 * Premium user authentication screen with FormField components.
 */

import React, { useState, useCallback, useRef } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Sentry from '@sentry/react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useTheme } from '../../theme';
import { Box, Text } from '../../components/primitives';
import { Button } from '../../components';
import { FormField } from '../../shared/ui/components/FormField';
import { useToast } from '../../shared/ui/components/Toast';
import { useAuthStore } from '../../store';
import { loginSchema, type LoginFormData } from '../../validation';
import type { AuthStackParams } from '../../navigation';

type Props = NativeStackScreenProps<AuthStackParams, 'Login'>;

/**
 * Login screen component
 */
export const LoginScreen: React.FC<Props> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { loginWithCredentials, devLogin, isLoading } = useAuthStore();
  const { show: showToast } = useToast();

  const [email, setEmail] = useState(route.params?.email ?? '');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  // Handle login
  const handleLogin = useCallback(async () => {
    // Validate form
    const result = loginSchema.safeParse({ email, password, rememberMe: false });

    if (!result.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      result.error.errors.forEach((err) => {
        const path = err.path[0] as 'email' | 'password';
        fieldErrors[path] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    // Clear validation errors
    setErrors({});

    // Attempt login
    const success = await loginWithCredentials(email, password);

    if (!success) {
      showToast({
        type: 'error',
        title: 'Sign in failed',
        message: 'Invalid email or password. Please try again.',
        duration: 4000,
      });
    }

    if (success && route.params?.returnTo) {
      // Navigate to return URL if provided
    }
  }, [email, password, loginWithCredentials, showToast, route.params?.returnTo]);

  // Navigate to register
  const handleRegister = useCallback(() => {
    navigation.navigate('Register');
  }, [navigation]);

  // Navigate to forgot password
  const handleForgotPassword = useCallback(() => {
    navigation.navigate('ForgotPassword');
  }, [navigation]);

  // Dev mode bypass
  const handleDevLogin = useCallback(() => {
    devLogin();
  }, [devLogin]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: theme.colors.background.primary }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 20 }}
        keyboardShouldPersistTaps="handled"
      >
        <Box flex={1} justifyContent="center" px="xl" py="2xl">
          {/* Logo / Header */}
          <Animated.View entering={FadeInDown.delay(0).duration(600)}>
            <Text variant="h1" textAlign="center" mb="xs">
              VEX
            </Text>
            <Text variant="body" color="text.secondary" textAlign="center" mb="2xl">
              Focus. Level up. Dominate.
            </Text>
          </Animated.View>

          {/* Form */}
          <Animated.View entering={FadeInDown.delay(150).duration(600)}>
            <FormField
              label="Email"
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                if (errors.email) {setErrors((prev) => ({ ...prev, email: undefined }));}
              }}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              leftIcon="email"
              size="lg"
              error={errors.email}
              returnKeyType="next"
            />

            <FormField
              label="Password"
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                if (errors.password) {setErrors((prev) => ({ ...prev, password: undefined }));}
              }}
              placeholder="Your password"
              secureTextEntry
              autoComplete="password"
              leftIcon="lock"
              size="lg"
              error={errors.password}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
              containerStyle={{ marginTop: 12 }}
            />
          </Animated.View>

          {/* Forgot password link */}
          <Animated.View entering={FadeInDown.delay(250).duration(600)}>
            <Pressable
              onPress={handleForgotPassword}
              style={{ alignSelf: 'flex-end', marginTop: 8, marginBottom: 24 }}
              accessibilityRole="link"
              accessibilityLabel="Forgot password"

            accessibilityHint="Activates this control">
              <Text variant="caption" color="primary.500">
                Forgot password?
              </Text>
            </Pressable>
          </Animated.View>

          {/* Submit */}
          <Animated.View entering={FadeInDown.delay(300).duration(600)}>
            <Button
              variant="primary"
              size="lg"
              onPress={handleLogin}
              isLoading={isLoading}
              disabled={isLoading}
              fullWidth

            accessibilityLabel="Sign In button"
            accessibilityRole="button"
            accessibilityHint="Activates this control">
              Sign In
            </Button>

            <Box flexDirection="row" justifyContent="center" mt="lg" gap="xs">
              <Text variant="body" color="text.secondary">
                Don't have an account?
              </Text>
              <Pressable onPress={handleRegister} accessibilityRole="link"
  accessibilityLabel="Sign up button"
  accessibilityHint="Activates this control">
                <Text variant="body" color="primary.500">
                  Sign up
                </Text>
              </Pressable>
            </Box>
          </Animated.View>

          {/* Dev Mode - for testing only */}
          <Animated.View entering={FadeInDown.delay(400).duration(600)}>
            <Box mt="2xl" style={{ borderTopWidth: 1, borderTopColor: theme.colors.border.light, paddingTop: 20 }}>
              <Button
                variant="secondary"
                onPress={handleDevLogin}
                style={{ alignSelf: 'center' }}

              accessibilityLabel="🚀 Dev Mode (Skip Login) button"
              accessibilityRole="button"
              accessibilityHint="Activates this control">
                🚀 Dev Mode (Skip Login)
              </Button>

              {/* Sentry Test Button */}
              <Button
                variant="outline"
                onPress={() => {
                  Sentry.captureException(new Error('First error'));
                }}
                style={{ alignSelf: 'center', marginTop: 12 }}

              accessibilityLabel="🐛 Test Sentry button"
              accessibilityRole="button"
              accessibilityHint="Activates this control">
                🐛 Test Sentry
              </Button>

              <Text variant="caption" color="text.tertiary" textAlign="center" style={{ marginTop: 8 }}>
                For development testing only
              </Text>
            </Box>
          </Animated.View>
        </Box>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
