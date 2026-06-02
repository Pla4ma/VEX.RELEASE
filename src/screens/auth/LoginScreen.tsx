import React from 'react';
import { Platform, Pressable, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppScreen, Text } from '../../components/primitives';
import { FormField } from '../../shared/ui/components/FormField';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useTheme } from '../../theme';
import { getMinTouchTargetStyle } from '../../utils/touchTarget';
import type { AuthStackParams } from '../../navigation';
import { useLoginScreen } from './useLoginScreen';
import { VexDevotionalBackground } from './components/VexDevotionalBackground';
import { VexEditorialMark } from './components/VexEditorialMark';
import { VexDevotionalCard } from './components/VexDevotionalCard';
import { EditorialCta } from './components/EditorialCta';
import { Stage } from './components/LoginStage';
import { EditorialFieldBlock } from './components/EditorialFieldBlock';
import { Colophon } from './components/Colophon';
import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';

type Props = NativeStackScreenProps<AuthStackParams, 'Login'>;

const SERIF_STACK = Platform.select({
  ios: 'New York',
  android: 'Noto Serif',
  default: 'Georgia',
}) ?? 'Georgia';

export const LoginScreen: React.FC<Props> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { isReducedMotion } = useReducedMotion();
  const {
    email,
    setEmail,
    password,
    setPassword,
    errors,
    setErrors,
    isLoading,
    handleLogin,
  } = useLoginScreen(route.params?.email ?? '');

  return (
    <AppScreen keyboardAvoiding contentStyle={{ gap: theme.spacing[5] }}>
      <VexDevotionalBackground />

      <Stage delay={120} isReducedMotion={isReducedMotion}>
        <VexEditorialMark
          title="VEX"
          edition="Vol. I"
          tagline="Protect one block. Leave with proof."
        />
      </Stage>

      <Stage delay={520} isReducedMotion={isReducedMotion}>
        <VexDevotionalCard delay={0} borderRadius={24} innerPadding={26}>
          <View style={{ gap: 18 }}>
            <EditorialFieldBlock label="Your credentials">
              <View style={{ height: 1 }} />
            </EditorialFieldBlock>
            <EditorialFieldBlock label="Email" error={errors.email}>
              <FormField
                accessibilityHint="Enter the email attached to your VEX account"
                accessibilityLabel="Account email"
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                onChangeText={(value: string) => {
                  setEmail(value);
                  if (errors.email) {
                    setErrors((prev: { email?: string; password?: string }) => ({ ...prev, email: undefined }));
                  }
                }}
                placeholder="you@example.com"
                returnKeyType="next"
                size="lg"
                value={email}
              />
            </EditorialFieldBlock>
            <EditorialFieldBlock label="Password" error={errors.password}>
              <FormField
                accessibilityHint="Enter your VEX account password"
                accessibilityLabel="Account password"
                autoComplete="password"
                containerStyle={{ marginBottom: 0 }}
                onChangeText={(value: string) => {
                  setPassword(value);
                  if (errors.password) {
                    setErrors((prev: { email?: string; password?: string }) => ({ ...prev, password: undefined }));
                  }
                }}
                onSubmitEditing={handleLogin}
                placeholder="Your password"
                returnKeyType="done"
                secureTextEntry
                size="lg"
                value={password}
              />
            </EditorialFieldBlock>
          </View>
        </VexDevotionalCard>
      </Stage>

      <Stage delay={760} isReducedMotion={isReducedMotion}>
        <View style={{ gap: theme.spacing[4] }}>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            <Pressable
              accessibilityHint="Opens password recovery"
              accessibilityLabel="Forgot password"
              accessibilityRole="link"
              onPress={() =>
                navigation.navigate({ name: 'ForgotPassword', params: undefined })
              }
              style={getMinTouchTargetStyle()}
            >
              <Text
                style={{
                  color: 'rgba(242,234,217,0.55)',
                  fontSize: 12,
                  fontFamily: SERIF_STACK,
                  fontStyle: 'italic',
                  letterSpacing: 0.4,
                }}
              >
                Forgot password?
              </Text>
            </Pressable>
          </View>

          <EditorialCta
            label="Enter VEX"
            loadingLabel="Entering…"
            isLoading={isLoading}
            onPress={handleLogin}
            delay={860}
          />

          <Pressable
            accessibilityHint="Creates a new VEX account"
            accessibilityLabel="Create a VEX account"
            accessibilityRole="link"
            onPress={() =>
              navigation.navigate({ name: 'Register', params: undefined })
            }
            style={[getMinTouchTargetStyle(), { alignSelf: 'center', marginTop: 8 }]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text
                style={{
                  color: 'rgba(242,234,217,0.55)',
                  fontSize: 13,
                  fontFamily: SERIF_STACK,
                  fontStyle: 'italic',
                }}
              >
                New here?
              </Text>
              <Text
                style={{
                  color: '#E0B870',
                  fontSize: 13,
                  fontFamily: SERIF_STACK,
                  fontWeight: '600',
                  letterSpacing: 0.5,
                }}
              >
                Begin a practice
              </Text>
            </View>
          </Pressable>
        </View>
      </Stage>

      <View style={{ marginTop: 12 }}>
        <Colophon delay={1500} isReducedMotion={isReducedMotion} />
      </View>
    </AppScreen>
  );
};

export default withScreenErrorBoundary(LoginScreen, 'Login');
