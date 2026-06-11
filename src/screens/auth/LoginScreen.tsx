/**
 * LoginScreen — June 2026 Ethereal Sky visual layer.
 *
 * Business logic (validation, OAuth, navigation) lives in
 * useLoginScreen. This file is presentation only.
 */
import React, { useCallback, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppScreen, Text } from '../../components/primitives';
import { useTheme } from '../../theme';
import { getMinTouchTargetStyle } from '../../utils/touchTarget';
import type { AuthStackParams } from '../../navigation';
import { useLoginScreen } from './useLoginScreen';
import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';
import { etherealText } from '@/theme/tokens/ethereal-sky';

import {
  EtherealAuthButtons,
  EtherealSkyBackground,
} from './components/ethereal';
import type { EtherealAuthProvider } from './components/ethereal';
import { LoginHero } from './components/ethereal/LoginHero';
import { LoginEmailForm } from './components/ethereal/LoginEmailForm';
import { LoginPrivacyStrip } from './components/ethereal/LoginPrivacyStrip';
import { VexMascotGuide } from '../onboarding/components/ethereal/VexMascotGuide';
import { BackgroundScrim } from '../onboarding/components/ethereal/BackgroundScrim';

type Props = NativeStackScreenProps<AuthStackParams, 'Login'>;

const OAUTH_PROVIDER_MAP: Record<EtherealAuthProvider, 'apple' | 'google' | null> = {
  apple: 'apple',
  google: 'google',
  email: null,
};

export const LoginScreen: React.FC<Props> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [showEmailForm, setShowEmailForm] = useState(false);
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
      if (provider === 'email') {
        setShowEmailForm(true);
        return;
      }
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
      bottomInset={false}
      contentStyle={{ flex: 1 }}
      keyboardAvoiding
      padded={false}
      scroll={false}
    >
      <EtherealSkyBackground />
      <BackgroundScrim intensity="login" />

      <View
        style={{
          flex: 1,
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 12,
          paddingHorizontal: theme.spacing[5],
        }}
      >
        <View style={{ flex: 1, justifyContent: 'space-between' }}>
          <View style={{ alignItems: 'center', marginTop: 16 }}>
            <LoginHero startDelayMs={120} />
          </View>

          <View style={{ width: '100%', maxWidth: 320, alignSelf: 'center', gap: 16 }}>
            <EtherealAuthButtons
              disabled={isLoading}
              onProviderPress={onProviderPress}
              startDelayMs={900}
            />

            {!showEmailForm ? (
              <VexMascotGuide
                message="I'll guide your first block."
                mood="wave"
              placement="inline"
              size="loginCompact"
              submessage="Sign in, then I'll walk you through setup."
              />
            ) : null}

            {showEmailForm ? (
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
            ) : null}

            {showEmailForm ? (
              <View style={{ alignItems: 'center' }}>
                <Pressable
                  accessibilityHint="Creates a new VEX account"
                  accessibilityLabel="Create a VEX account"
                  accessibilityRole="link"
                  hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
                  onPress={onCreateAccount}
                  style={getMinTouchTargetStyle()}
                >
                  <Text
                    color={etherealText.heading}
                    fontSize={14}
                    style={{ color: etherealText.subtitle }}
                    textAlign="center"
                  >
                    New here?{' '}
                    <Text
                      fontSize={14}
                      fontWeight="700"
                      style={{ color: etherealText.heading, textDecorationLine: 'underline' }}
                    >
                      Create your focus system
                    </Text>
                  </Text>
                </Pressable>
              </View>
            ) : null}

            {!showEmailForm ? <LoginPrivacyStrip /> : null}
          </View>
        </View>
      </View>
    </AppScreen>
  );
};

export default withScreenErrorBoundary(LoginScreen, 'Login');
