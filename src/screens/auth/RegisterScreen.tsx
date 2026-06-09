/**
 * RegisterScreen — June 2026 Ethereal Sky visual layer.
 *
 * Business logic (validation, registration) lives in the auth store;
 * this file is presentation only.
 */
import React, { useCallback, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppScreen, Text } from '../../components/primitives';
import { Button } from '../../components/primitives/Button';
import type { AuthStackParams } from '../../navigation';
import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';
import { useToast } from '../../shared/ui/components/Toast';
import { useAuthStore } from '../../store/index';
import { registerSchema, type RegisterFormData } from './schemas';
import { EtherealSkyBackground } from './components/ethereal';
import { etherealText } from '@/theme/tokens/ethereal-sky';
import { RegisterFormPanel } from './components/ethereal/RegisterFormPanel';
import { RegisterHero } from './components/ethereal/RegisterHero';
import { getMinTouchTargetStyle } from '../../utils/touchTarget';
import { MascotGuide } from '../onboarding/components/ethereal/MascotGuide';

type Props = NativeStackScreenProps<AuthStackParams, 'Register'>;
type RegisterErrors = Partial<Record<keyof RegisterFormData, string>>;

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { register, isLoading } = useAuthStore();
  const { show: showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<RegisterErrors>({});

  const clearError = useCallback(
    (field: keyof RegisterFormData): void => {
      if (errors[field]) {
        setErrors((previous) => ({ ...previous, [field]: undefined }));
      }
    },
    [errors],
  );

  const handleRegister = useCallback(async (): Promise<void> => {
    if (isLoading) {return;}
    const result = registerSchema.safeParse({
      agreeToTerms: true,
      confirmPassword: password,
      email: email.trim().toLowerCase(),
      firstName: '',
      lastName: '',
      password,
    });

    if (!result.success) {
      const fieldErrors: RegisterErrors = {};
      result.error.errors.forEach((error) => {
        const field = error.path[0];
        if (field === 'email' || field === 'password' || field === 'confirmPassword') {
          fieldErrors[field] = error.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    const success = await register(result.data);
    if (!success) {
      const authError =
        useAuthStore.getState().error ?? 'Check the details and try again.';
      showToast({ duration: 4000, message: authError, title: 'Signup did not finish', type: 'error' });
    }
  }, [email, isLoading, password, register, showToast]);

  const onChangeEmail = useCallback(
    (value: string) => { setEmail(value); clearError('email'); },
    [clearError],
  );
  const onChangePassword = useCallback(
    (value: string) => { setPassword(value); clearError('password'); },
    [clearError],
  );
  const onGoToLogin = useCallback(() => { navigation.navigate({ name: 'Login', params: {} }); }, [navigation]);
  const onBack = useCallback(() => { navigation.goBack(); }, [navigation]);

  return (
    <AppScreen
      contentStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 16 }}
      keyboardAvoiding
      padded={false}
    >
      <EtherealSkyBackground />

      <View style={{ flex: 1, paddingTop: insets.top + 16, paddingHorizontal: 24 }}>
        <RegisterHero startDelayMs={120} />

        <View style={{ marginTop: 18 }}>
          <MascotGuide
            body="Create the account, then I will guide setup without blocking the app."
            compact
            title="Protected focus starts here."
          />
        </View>

        <View style={{ marginTop: 18 }}>
          <RegisterFormPanel
            fields={{
              email,
              emailError: errors.email,
              password,
              passwordError: errors.password,
            }}
            isLoading={isLoading}
            onChangeEmail={onChangeEmail}
            onChangePassword={onChangePassword}
            onSubmit={() => { void handleRegister(); }}
          />
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 16,
            gap: 4,
          }}
        >
          <Text color={etherealText.heading} variant="body" style={{ color: etherealText.subtitle }}>
            Already have an account?
          </Text>
          <Pressable
            accessibilityHint="Returns to sign in"
            accessibilityLabel="Sign in to an existing VEX account"
            accessibilityRole="link"
            onPress={onGoToLogin}
            style={getMinTouchTargetStyle()}
          >
            <Text color={etherealText.heading} fontWeight="700" style={{ color: etherealText.heading, textDecorationLine: 'underline' }}>
              Sign in
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={{ alignItems: 'center', paddingTop: 16 }}>
        <Button
          accessibilityHint="Returns to the sign in screen"
          accessibilityLabel="Back to sign in"
          onPress={onBack}
          variant="ghost"
        >
          Back
        </Button>
      </View>
    </AppScreen>
  );
};

export default withScreenErrorBoundary(RegisterScreen, 'Register');
