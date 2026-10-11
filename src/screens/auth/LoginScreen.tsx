import React, { useCallback, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppScreen } from '../../components/primitives/AppScreen';
import { Text } from '../../components/primitives/Text';
import { useTheme } from '../../theme/ThemeContext';
import { getMinTouchTargetStyle } from '../../utils/touchTarget';
import type { AuthStackParams } from '../../navigation';
import { useLoginScreen } from './useLoginScreen';
import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';
import type { EtherealAuthProvider } from './components/ethereal';
import { LoginEmailForm } from './components/ethereal/LoginEmailForm';
import { canSkipLogin } from '../../config/dev-identity';

type Props = NativeStackScreenProps<AuthStackParams, 'Login'>;

const OAUTH_PROVIDER_MAP: Record<EtherealAuthProvider, 'apple' | 'google' | null> = {
  apple: 'apple',
  google: 'google',
  email: null,
};

function AuthOption({
  label,
  onPress,
  primary = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  primary?: boolean;
  disabled?: boolean;
}): React.ReactNode {
  const { theme } = useTheme();
  return (
    <Pressable
      accessibilityHint={`${label} for your VEX account`}
      accessibilityLabel={label}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        getMinTouchTargetStyle(),
        {
          alignItems: 'center',
          backgroundColor: primary ? theme.colors.primary[500] : theme.colors.surface.card,
          borderColor: primary ? theme.colors.primary[500] : theme.colors.border.DEFAULT,
          borderRadius: theme.borderRadius.lg,
          borderWidth: 1,
          justifyContent: 'center',
          opacity: disabled ? 0.55 : pressed ? 0.78 : 1,
          paddingHorizontal: theme.spacing[4],
          paddingVertical: theme.spacing[3],
        },
      ]}
    >
      <Text color={primary ? 'text.inverse' : 'text.primary'} variant="button">
        {label}
      </Text>
    </Pressable>
  );
}

const LoginScreen: React.ComponentType<Props> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [showEmailForm, setShowEmailForm] = useState(false);
  const {
    email, setEmail, password, setPassword,
    errors, setErrors, isLoading, handleLogin, handleOAuthLogin, handleSkipLogin,
  } = useLoginScreen(route.params?.email ?? '');

  const hem = useCallback((value: string) => {
    setEmail(value);
    if (errors.email) setErrors((current) => ({ ...current, email: undefined }));
  }, [errors.email, setEmail, setErrors]);

  const hpm = useCallback((value: string) => {
    setPassword(value);
    if (errors.password) setErrors((current) => ({ ...current, password: undefined }));
  }, [errors.password, setPassword, setErrors]);

  const onProviderPress = useCallback((provider: EtherealAuthProvider): void => {
    const mapped = OAUTH_PROVIDER_MAP[provider];
    if (provider === 'email') {
      setShowEmailForm(true);
      return;
    }
    if (mapped) {
      handleOAuthLogin(mapped).catch(() => undefined);
    }
  }, [handleOAuthLogin]);

  return (
    <AppScreen bottomInset={false} contentStyle={{ flexGrow: 1 }} keyboardAvoiding padded={false} scroll>
      <View
        style={{
          flexGrow: 1,
          paddingBottom: insets.bottom + theme.spacing[4],
          paddingHorizontal: theme.spacing[5],
          paddingTop: insets.top + theme.spacing[6],
        }}
      >
        <View style={{ flexGrow: 1, gap: theme.spacing[6], justifyContent: 'space-between' }}>
          <View style={{ gap: theme.spacing[3] }}>
            <View style={{ alignItems: 'center', flexDirection: 'row', gap: theme.spacing[2] }}>
              <View style={{ backgroundColor: theme.colors.primary[500], borderRadius: theme.borderRadius.full, height: 10, width: 10 }} />
              <Text variant="h2">VEX</Text>
            </View>
            <Text color="primary.500" variant="label">Focus adapts to you</Text>
            <Text variant="h1">Make the next block easier to start.</Text>
            <Text color="text.secondary" variant="body">
              VEX learns from real sessions, then gives you one useful next move.
            </Text>
          </View>

          <View style={{ alignSelf: 'center', gap: theme.spacing[3], maxWidth: 320, width: '100%' }}>
            <AuthOption disabled={isLoading} label="Continue with Google" onPress={() => onProviderPress('google')} primary />
            <AuthOption disabled={isLoading} label="Continue with Apple" onPress={() => onProviderPress('apple')} />
            <AuthOption disabled={isLoading} label="Continue with Email" onPress={() => onProviderPress('email')} />
            {canSkipLogin(__DEV__, process.env.EXPO_PUBLIC_ENVIRONMENT, process.env.EXPO_PUBLIC_ENABLE_SKIP_LOGIN) ? (
              <Pressable
                accessibilityHint="Opens VEX for local testing without an account"
                accessibilityLabel="Skip login and onboarding"
                accessibilityRole="button"
                disabled={isLoading}
                onPress={handleSkipLogin}
                style={({ pressed }) => [
                  getMinTouchTargetStyle(),
                  {
                    alignItems: 'center',
                    borderColor: theme.colors.border.DEFAULT,
                    borderRadius: theme.borderRadius.lg,
                    borderWidth: 1,
                    justifyContent: 'center',
                    opacity: pressed ? 0.72 : 1,
                    paddingHorizontal: theme.spacing[4],
                    paddingVertical: theme.spacing[3],
                  },
                ]}
              >
                <Text color="text.secondary" variant="button">Skip login</Text>
              </Pressable>
            ) : null}
            {showEmailForm ? (
              <LoginEmailForm
                email={email}
                emailError={errors.email}
                isLoading={isLoading}
                onChangeEmail={hem}
                onChangePassword={hpm}
                onForgotPassword={() => navigation.navigate('ForgotPassword')}
                onSubmit={handleLogin}
                password={password}
                passwordError={errors.password}
              />
            ) : null}
            {showEmailForm ? (
              <Pressable
                accessibilityHint="Creates a new VEX account"
                accessibilityLabel="Create a VEX account"
                accessibilityRole="link"
                onPress={() => navigation.navigate('Register')}
                style={getMinTouchTargetStyle()}
              >
                <Text color="text.secondary" textAlign="center" variant="bodySmall">
                  New here? <Text style={{ color: theme.colors.primary[500], fontWeight: '800' }} variant="bodySmall">Create your focus system</Text>
                </Text>
              </Pressable>
            ) : null}
          </View>

          {!showEmailForm ? (
            <Text color="text.tertiary" textAlign="center" variant="caption">
              Your focus stays yours. Private by design.
            </Text>
          ) : null}
        </View>
      </View>
    </AppScreen>
  );
};

const LoginScreenWithBoundary = withScreenErrorBoundary(LoginScreen, 'Login');
export { LoginScreenWithBoundary as LoginScreen };
