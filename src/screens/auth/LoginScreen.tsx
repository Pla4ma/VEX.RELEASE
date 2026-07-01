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

import { AppScreen } from '../../components/primitives/AppScreen';
import { Text } from '../../components/primitives/Text';
import { useTheme } from '../../theme/ThemeContext';
import { getMinTouchTargetStyle } from '../../utils/touchTarget';
import type { AuthStackParams } from '../../navigation';
import { useOnboardingStore } from '../../features/onboarding/store';
import { useAuthStore } from '../../store';
import { useLoginScreen } from './useLoginScreen';
import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';
import { etherealText } from '@/theme/tokens/ethereal-sky';
import type { User } from '../../types/models/user';

import {
  EtherealAuthButtons,
} from './components/ethereal/EtherealAuthButtons';
import { EtherealSkyBackground } from './components/ethereal/EtherealSkyBackground';
import type { EtherealAuthProvider } from './components/ethereal';
import { LoginHero } from './components/ethereal/LoginHero';
import { LoginEmailForm } from './components/ethereal/LoginEmailForm';
import { LoginPrivacyStrip } from './components/ethereal/LoginPrivacyStrip';
import { BackgroundScrim } from '../onboarding/components/ethereal/BackgroundScrim';

type Props = NativeStackScreenProps<AuthStackParams, 'Login'>;

const OAUTH_PROVIDER_MAP: Record<EtherealAuthProvider, 'apple' | 'google' | null> = {
  apple: 'apple',
  google: 'google',
  email: null,
};

const DEV_BYPASS_USER_ID = '00000000-0000-0000-0000-000000000001';

const createDevBypassUser = (): User => {
  const now = new Date().toISOString();

  return {
    id: DEV_BYPASS_USER_ID,
    createdAt: now,
    updatedAt: now,
    username: 'localdev',
    email: 'local-dev@vex.app',
    firstName: 'Local',
    lastName: 'Dev',
    displayName: 'Local Dev',
    verified: true,
    role: 'user',
    status: 'active',
    onboardingCompletedAt: now,
    preferences: {
      theme: 'system',
      language: 'en',
      notifications: {
        push: false,
        email: false,
        sms: false,
        inApp: true,
        digestFrequency: 'never',
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '07:00',
          timezone: 'America/New_York',
        },
      },
      privacy: {
        profileVisibility: 'private',
        activityStatus: false,
        readReceipts: false,
        allowTagging: false,
        allowMentions: false,
        dataSharing: false,
      },
      accessibility: {
        reduceMotion: false,
        highContrast: false,
        largeText: false,
        screenReaderOptimized: false,
      },
    },
    metadata: {
      lastLoginAt: now,
      loginCount: 1,
      signupSource: 'dev-bypass',
      deviceHistory: [],
    },
  };
};

const LoginScreen: React.ComponentType<Props> = ({ navigation, route }) => {
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
        handleOAuthLogin(mapped).catch(() => undefined);
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

  const onSkipLogin = useCallback(() => {
    useAuthStore.getState().login(createDevBypassUser());
    useOnboardingStore.getState().completeOnboarding(DEV_BYPASS_USER_ID);
  }, []);

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

            {__DEV__ ? (
              <Pressable
                accessibilityHint="Opens the app with a local development account"
                accessibilityLabel="Skip login and onboarding"
                accessibilityRole="button"
                onPress={onSkipLogin}
                style={({ pressed }) => [
                  getMinTouchTargetStyle(),
                  {
                    alignItems: 'center',
                    borderColor: etherealText.subtitle,
                    borderRadius: theme.borderRadius.lg,
                    borderWidth: 1,
                    justifyContent: 'center',
                    opacity: pressed ? 0.72 : 1,
                    paddingHorizontal: theme.spacing[4],
                    paddingVertical: theme.spacing[3],
                  },
                ]}
              >
                <Text
                  color={etherealText.heading}
                  fontSize={14}
                  fontWeight="700"
                  textAlign="center"
                >
                  Skip login
                </Text>
              </Pressable>
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

const LoginScreenWithBoundary = withScreenErrorBoundary(LoginScreen, 'Login');
export { LoginScreenWithBoundary as LoginScreen };
