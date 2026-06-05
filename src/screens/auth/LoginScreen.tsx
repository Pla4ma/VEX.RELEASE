/**
 * LoginScreen — June 2026 Ethereal Sky visual layer.
 *
 * Business logic (validation, OAuth, navigation) lives in
 * useLoginScreen. This file is presentation only.
 */
import React, { useCallback } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppScreen, Text } from '../../components/primitives';
import { useTheme } from '../../theme';
import { getMinTouchTargetStyle } from '../../utils/touchTarget';
import type { AuthStackParams } from '../../navigation';
import { useLoginScreen } from './useLoginScreen';
import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';

import {
  EtherealAuthButtons,
  EtherealSkyBackground,
} from './components/ethereal';
import type { EtherealAuthProvider } from './components/ethereal';
import { LoginHero } from './components/ethereal/LoginHero';
import { LoginEmailForm } from './components/ethereal/LoginEmailForm';

type Props = NativeStackScreenProps<AuthStackParams, 'Login'>;

const OAUTH_PROVIDER_MAP: Record<EtherealAuthProvider, 'apple' | 'google' | null> = {
  apple: 'apple',
  google: 'google',
  email: null,
};

export const LoginScreen: React.FC<Props> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const {
    email, setEmail, password, setPassword,
    errors, setErrors, isLoading, handleLogin, handleOAuthLogin,
  } = useLoginScreen(route.params?.email ?? '');

  const hem = useCallback((v: string) => {
    setEmail(v);
    if (errors.email) {
      setErrors((c) => ({ ...c, email: undefined }));
    }
  }, [errors.email, setEmail, setErrors]);

  const hpm = useCallback((v: string) => {
    setPassword(v);
    if (errors.password) {
      setErrors((c) => ({ ...c, password: undefined }));
    }
  }, [errors.password, setPassword, setErrors]);

  const onProviderPress = useCallback(
    (provider: EtherealAuthProvider) => {
      const mapped = OAUTH_PROVIDER_MAP[provider];
      if (mapped) {
        void handleOAuthLogin(mapped);
      }
    },
    [handleOAuthLogin],
  );

  const onForgotPassword = useCallback(() => {
    navigation.navigate({ name: 'ForgotPassword', params: undefined });
  }, [navigation]);

  const onCreateAccount = useCallback(() => {
    navigation.navigate({ name: 'Register', params: undefined });
  }, [navigation]);

  return (
    <AppScreen
      contentStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 16 }}
      keyboardAvoiding
      padded={false}
    >
      <EtherealSkyBackground />

      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: insets.top + 16,
          paddingHorizontal: theme.spacing[5],
        }}
      >
        <LoginHero startDelayMs={120} />

        <View style={{ width: '100%', maxWidth: 440, alignSelf: 'center', gap: 16 }}>
          <EtherealAuthButtons
            disabled={isLoading}
            onProviderPress={onProviderPress}
            startDelayMs={900}
          />

          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              gap: 12,
              marginVertical: 8,
            }}
          >
            <View
              style={{ flex: 1, height: 1, backgroundColor: 'rgba(10, 10, 10, 0.12)' }}
            />
            <Text
              color="#0A0A0A"
              fontSize={11}
              fontWeight="700"
              style={{ color: 'rgba(10, 10, 10, 0.55)', letterSpacing: 2 }}
            >
              OR SIGN IN
            </Text>
            <View
              style={{ flex: 1, height: 1, backgroundColor: 'rgba(10, 10, 10, 0.12)' }}
            />
          </View>

          <LoginEmailForm
            email={email}
            emailError={errors.email}
            isLoading={isLoading}
            onChangeEmail={hem}
            onChangePassword={hpm}
            onForgotPassword={onForgotPassword}
            onSubmit={handleLogin}
            password={password}
            passwordError={errors.password}
          />

          <View style={{ alignItems: 'center', marginTop: 8 }}>
            <Pressable
              accessibilityHint="Creates a new VEX account"
              accessibilityLabel="Create a VEX account"
              accessibilityRole="link"
              hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
              onPress={onCreateAccount}
              style={getMinTouchTargetStyle()}
            >
              <Text
                color="#0A0A0A"
                fontSize={14}
                style={{ color: 'rgba(10, 10, 10, 0.78)' }}
                textAlign="center"
              >
                New here?{' '}
                <Text
                  fontSize={14}
                  fontWeight="700"
                  style={{ color: '#0A0A0A', textDecorationLine: 'underline' }}
                >
                  Create your focus system
                </Text>
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </AppScreen>
  );
};

export default withScreenErrorBoundary(LoginScreen, 'Login');
