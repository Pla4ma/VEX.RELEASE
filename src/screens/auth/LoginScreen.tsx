import React, { useCallback } from 'react';
import { Pressable, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppScreen, Text } from '../../components/primitives';
import { useTheme } from '../../theme';
import { getMinTouchTargetStyle } from '../../utils/touchTarget';
import type { AuthStackParams } from '../../navigation';
import { useLoginScreen } from './useLoginScreen';
import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';
import { lightColors } from '@/theme/tokens/colors';
import { VexAtmosphereCanvas } from './components/VexAuroraCanvas';
import { VexBrandHeader } from './components/VexBrandHeader';
import { VexConsole } from './components/VexGlassPanel';
import { VexGlassInput } from './components/VexGlassInput';
import { VexActivationButton } from './components/VexPrimaryButton';
import { Stage } from './components/LoginStage';
import { OAuthProviderButtons } from './components/OAuthProviderButtons';

type Props = NativeStackScreenProps<AuthStackParams, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const {
    email, setEmail, password, setPassword,
    errors, setErrors, isLoading, handleLogin, handleOAuthLogin, isReducedMotion,
  } = useLoginScreen(route.params?.email ?? '');

  const hem = useCallback((v: string) => {
    setEmail(v);
    if (errors.email) setErrors((c) => ({ ...c, email: undefined }));
  }, [errors.email, setEmail, setErrors]);
  const hpm = useCallback((v: string) => {
    setPassword(v);
    if (errors.password) setErrors((c) => ({ ...c, password: undefined }));
  }, [errors.password, setErrors, setPassword]);

  return (
    <AppScreen keyboardAvoiding padded={false}
      contentStyle={{ flexGrow: 1, justifyContent: 'center',
        paddingHorizontal: theme.spacing[5] }}>
      <VexAtmosphereCanvas />
      <View style={{ flex: 1, justifyContent: 'center',
        paddingTop: theme.spacing[4], paddingBottom: theme.spacing[10] }}>
        <Stage delay={0} isReducedMotion={isReducedMotion}>
          <VexBrandHeader />
        </Stage>
        <Stage delay={300} isReducedMotion={isReducedMotion}>
          <View style={{ width: '100%', maxWidth: 440, alignSelf: 'center',
            marginTop: theme.spacing[8] }}>
            <OAuthProviderButtons
              disabled={isLoading}
              onProviderPress={handleOAuthLogin}
            />
            <View style={{
              alignItems: 'center',
              flexDirection: 'row',
              gap: theme.spacing[3],
              marginVertical: theme.spacing[5],
            }}>
              <View style={{
                backgroundColor: theme.colors.semantic.liquidGlassBorder,
                flex: 1,
                height: 1,
              }} />
              <Text color="semantic.liquidTextMuted" fontSize={12} fontWeight="700">
                EMAIL
              </Text>
              <View style={{
                backgroundColor: theme.colors.semantic.liquidGlassBorder,
                flex: 1,
                height: 1,
              }} />
            </View>
            <VexConsole>
              <View style={{ alignItems: 'center', marginBottom: 2 }}>
                <Text color="semantic.liquidText" fontSize={19} fontWeight="700"
                  opacity={0.95} lineHeight={25} textAlign="center">
                  Welcome back
                </Text>
                <Text color="semantic.liquidTextSoft" fontSize={13} fontWeight="500"
                  opacity={0.68} lineHeight={19} textAlign="center">
                  Resume your focus system
                </Text>
              </View>
              <View style={{ gap: theme.spacing[1] }}>
                <VexGlassInput autoComplete="email" error={errors.email}
                  keyboardType="email-address" label="Email"
                  onChangeText={hem} placeholder="you@vex.app"
                  returnKeyType="next" value={email} />
                <VexGlassInput autoComplete="password" error={errors.password}
                  label="Password" onChangeText={hpm}
                  onSubmitEditing={handleLogin} placeholder="Enter password"
                  returnKeyType="done" secureTextEntry value={password} />
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Pressable accessibilityHint="Opens password recovery"
                  accessibilityLabel="Forgot password" accessibilityRole="link"
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  onPress={() => navigation.navigate(
                    { name: 'ForgotPassword', params: undefined })}
                  style={getMinTouchTargetStyle()}>
                  <Text color="semantic.liquidTextMuted" fontSize={13}
                    fontWeight="600" opacity={0.74}>Forgot password?</Text>
                </Pressable>
              </View>
              <VexActivationButton isLoading={isLoading}
                label="Enter VEX" loadingLabel="Opening" onPress={handleLogin} />
              <View style={{ alignItems: 'center', marginTop: 4 }}>
                <Text color="semantic.liquidTextMuted" fontSize={11}
                  fontWeight="500" opacity={0.54} textAlign="center"
                  letterSpacing={0.3}>
                  Coach ready{'\u00A0\u00B7\u00A0'}Focus sync{'\u00A0\u00B7\u00A0'}Secure vault
                </Text>
              </View>
            </VexConsole>
            <View style={{ marginTop: 40, alignItems: 'center' }}>
              <Pressable accessibilityHint="Creates a new VEX account"
                accessibilityLabel="Create a VEX account" accessibilityRole="link"
                hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
                onPress={() => navigation.navigate(
                  { name: 'Register', params: undefined })}
                style={getMinTouchTargetStyle()}>
                <Text color="semantic.liquidTextMuted" fontSize={14}
                  textAlign="center" opacity={0.78}>
                  New here?{' '}
                  <Text fontWeight="700" style={{
                    color: lightColors.semantic.brandAmber,
                    textShadowColor: lightColors.semantic.editorialGoldGlow,
                    textShadowOffset: { width: 0, height: 0 },
                    textShadowRadius: 8,
                  }}>Create your focus system</Text>
                </Text>
              </Pressable>
            </View>
          </View>
        </Stage>
      </View>
    </AppScreen>
  );
};

export default withScreenErrorBoundary(LoginScreen, 'Login');
