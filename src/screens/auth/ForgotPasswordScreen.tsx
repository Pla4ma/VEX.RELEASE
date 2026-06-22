/**
 * ForgotPasswordScreen — June 2026 Ethereal Sky visual layer.
 *
 * Business logic in useForgotPasswordForm. This file is presentation only.
 */
import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';
import { Text } from '../../components/primitives/Text';
import { FormField } from '../../shared/ui/components/FormField';
import { VexActivationButton } from './components/VexPrimaryButton';
import type { AuthStackParams } from '../../navigation';
import { useForgotPasswordForm } from './useForgotPasswordForm';
import { EtherealMedallion } from './components/ethereal/EtherealMedallion';
import { EtherealSkyBackground } from './components/ethereal/EtherealSkyBackground';
import { GlassSurface } from './components/ethereal/GlassSurface';
import { SerifTitle } from './components/ethereal/SerifTitle';
import { etherealText } from '@/theme/tokens/ethereal-sky';

type Props = NativeStackScreenProps<AuthStackParams, 'ForgotPassword'>;

export const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { email, setEmail, error, setError, isLoading, isSuccess, handleSubmit, handleBack } =
    useForgotPasswordForm(navigation);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <EtherealSkyBackground />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: insets.bottom + 24,
          paddingTop: insets.top + 16,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ paddingHorizontal: 24 }}>
          <View>
            <View style={{ alignItems: 'center', gap: 16, marginTop: 8 }}>
              <EtherealMedallion size={100} />
              <View style={{ alignItems: 'center', gap: 4 }}>
                <SerifTitle
                  color={etherealText.heading}
                  fontSize={30}
                  letterSpacing={-0.5}
                  lineHeight={36}
                  text={isSuccess ? 'Email sent' : 'Reset password'}
                />
                <Text
                  color={etherealText.heading}
                  fontSize={13}
                  style={{ color: etherealText.body, textAlign: 'center' }}
                >
                  {isSuccess
                    ? `We sent password reset instructions to ${email}`
                    : 'Enter your email and we will send you instructions to reset your password'}
                </Text>
              </View>
            </View>
          </View>

          {isSuccess ? (
            <View>
              <View style={{ marginTop: 32, alignItems: 'center' }}>
                <GlassSurface borderRadius={24} style={{ padding: 20, width: '100%' }}>
                  <Text
                    color={etherealText.heading}
                    fontSize={14}
                    style={{ color: etherealText.subtitle, textAlign: 'center' }}
                  >
                    Check your inbox in a few minutes.
                  </Text>
                </GlassSurface>
                <VexActivationButton
                  isLoading={false}
                  label="Back to sign in"
                  loadingLabel="Going back"
                  onPress={handleBack}
                />
              </View>
            </View>
          ) : (
            <View>
              <View style={{ marginTop: 32, gap: 16 }}>
                <GlassSurface borderRadius={28} style={{ padding: 20 }}>
                  <FormField
                    accessibilityLabel="Email address"
                    autoCapitalize="none"
                    autoComplete="email"
                    disabled={isLoading}
                    error={error}
                    keyboardType="email-address"
                    label="Email Address"
                    leftIcon="email"
                    onChangeText={(value) => {
                      setEmail(value);
                      if (error) {
                        setError(undefined);
                      }
                    }}
                    onSubmitEditing={handleSubmit}
                    placeholder="you@example.com"
                    returnKeyType="done"
                    size="lg"
                    value={email}
                  />
                </GlassSurface>
                <VexActivationButton
                  isLoading={isLoading}
                  label="Send reset link"
                  loadingLabel="Sending"
                  onPress={handleSubmit}
                />
                <Text
                  color={etherealText.heading}
                  variant="caption"
                  style={{ color: etherealText.muted, textAlign: 'center' }}
                >
                  Did not receive the email? Check your spam folder or try again.
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const ForgotPasswordScreenWithBoundary = withScreenErrorBoundary(ForgotPasswordScreen, 'ForgotPassword');
export { ForgotPasswordScreenWithBoundary as ForgotPasswordScreen };
