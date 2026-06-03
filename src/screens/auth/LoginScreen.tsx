import React, { useCallback } from 'react';
import { Pressable, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppScreen, Text } from '../../components/primitives';
import { useTheme } from '../../theme';
import { getMinTouchTargetStyle } from '../../utils/touchTarget';
import type { AuthStackParams } from '../../navigation';
import { useLoginScreen } from './useLoginScreen';
import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';
import { VexAtmosphereCanvas } from './components/VexAuroraCanvas';
import { VexBrandHeader } from './components/VexBrandHeader';
import { VexConsole } from './components/VexGlassPanel';
import { VexGlassInput } from './components/VexGlassInput';
import { VexActivationButton } from './components/VexPrimaryButton';
import { Stage } from './components/LoginStage';

type Props = NativeStackScreenProps<AuthStackParams, 'Login'>;

function ConsoleHeading(): React.JSX.Element {
  return (
    <View style={{ alignItems: 'center', marginBottom: 12 }}>
      <Text color="semantic.liquidText" fontSize={19} fontWeight="700" opacity={0.95} lineHeight={25} textAlign="center">Welcome back</Text>
      <Text color="semantic.liquidTextSoft" fontSize={13} fontWeight="500" opacity={0.72} lineHeight={19} textAlign="center">Resume your focus system</Text>
    </View>
  );
}

function ConsoleFooter(): React.JSX.Element {
  return (
    <View style={{ alignItems: 'center', marginTop: 4 }}>
      <Text color="semantic.liquidTextMuted" fontSize={11} fontWeight="500" opacity={0.50} textAlign="center">Neural coach &middot; Focus sync &middot; Secure vault</Text>
    </View>
  );
}

function RegisterCta({ onPress }: { onPress: () => void }): React.JSX.Element {
  return (
    <View style={{ marginTop: 40, alignItems: 'center' }}>
      <Pressable
        accessibilityHint="Creates a new VEX account" accessibilityLabel="Create a VEX account"
        accessibilityRole="link" hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
        onPress={onPress} style={getMinTouchTargetStyle()}
      >
        <Text color="semantic.liquidTextMuted" fontSize={14} textAlign="center" opacity={0.82}>
          New here?{' '}
          <Text fontWeight="700" style={{ color: '#FFC46B', textShadowColor: 'rgba(255, 196, 107, 0.35)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8 }}>
            Create your focus system
          </Text>
        </Text>
      </Pressable>
    </View>
  );
}

export const LoginScreen: React.FC<Props> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const {
    email, setEmail, password, setPassword,
    errors, setErrors, isLoading, handleLogin, isReducedMotion,
  } = useLoginScreen(route.params?.email ?? '');

  const handleEmailChange = useCallback((value: string): void => {
    setEmail(value);
    if (errors.email) { setErrors((c) => ({ ...c, email: undefined })); }
  }, [errors.email, setEmail, setErrors]);

  const handlePasswordChange = useCallback((value: string): void => {
    setPassword(value);
    if (errors.password) { setErrors((c) => ({ ...c, password: undefined })); }
  }, [errors.password, setErrors, setPassword]);

  return (
    <AppScreen keyboardAvoiding padded={false}
      contentStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: theme.spacing[5] }}
    >
      <VexAtmosphereCanvas />
      <View style={{ flex: 1, justifyContent: 'center', paddingTop: theme.spacing[6], paddingBottom: theme.spacing[10] }}>
        <Stage delay={0} isReducedMotion={isReducedMotion}><VexBrandHeader /></Stage>
        <Stage delay={200} isReducedMotion={isReducedMotion}>
          <View style={{ width: '100%', maxWidth: 400, alignSelf: 'center', marginTop: theme.spacing[6] }}>
            <VexConsole>
              <ConsoleHeading />
              <View style={{ gap: theme.spacing[1] }}>
                <VexGlassInput autoComplete="email" error={errors.email} keyboardType="email-address" label="Email" onChangeText={handleEmailChange} placeholder="you@vex.app" returnKeyType="next" value={email} />
                <VexGlassInput autoComplete="password" error={errors.password} label="Password" onChangeText={handlePasswordChange} onSubmitEditing={handleLogin} placeholder="Enter password" returnKeyType="done" secureTextEntry value={password} />
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Pressable accessibilityHint="Opens password recovery" accessibilityLabel="Forgot password" accessibilityRole="link" hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} onPress={() => navigation.navigate({ name: 'ForgotPassword', params: undefined })} style={getMinTouchTargetStyle()}>
                  <Text color="semantic.liquidTextMuted" fontSize={13} fontWeight="600" opacity={0.75}>Forgot password?</Text>
                </Pressable>
              </View>
              <VexActivationButton isLoading={isLoading} label="Enter VEX" loadingLabel="Opening" onPress={handleLogin} />
              <ConsoleFooter />
            </VexConsole>
            <RegisterCta onPress={() => navigation.navigate({ name: 'Register', params: undefined })} />
          </View>
        </Stage>
      </View>
    </AppScreen>
  );
};

export default withScreenErrorBoundary(LoginScreen, 'Login');
