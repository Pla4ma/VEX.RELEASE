import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';
import React from 'react';
import { Pressable, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Sentry from '@sentry/react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import {
  AppScreen,
  Box,
  Button,
  Text,
} from '../../components/primitives';
import { AuthValuePreview } from './components/AuthValuePreview';
import { FormField } from '../../shared/ui/components/FormField';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useTheme } from '../../theme';
import { getMinTouchTargetStyle } from '../../utils/touchTarget';
import type { AuthStackParams } from '../../navigation';
import { useLoginScreen } from './useLoginScreen';
import { AuthHeroBrand } from './components/AuthHeroBrand';
import { AuthCommandPanel } from './components/AuthCommandPanel';
import { VexEntryBackground } from './components/VexEntryBackground';

type Props = NativeStackScreenProps<AuthStackParams, 'Login'>;

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
    introEntering,
    bodyEntering,
    actionEntering,
  } = useLoginScreen(route.params?.email ?? '');

  return (
    <AppScreen keyboardAvoiding contentStyle={{ gap: theme.spacing[5] }}>
      <VexEntryBackground />

      <Animated.View entering={introEntering}>
        <AuthHeroBrand
          label="VEX Command"
          title="VEX"
          tagline="Protect one block. Leave with proof."
        />
      </Animated.View>

      <Animated.View entering={bodyEntering}>
        <AuthValuePreview />
      </Animated.View>

      <Animated.View entering={bodyEntering}>
        <AuthCommandPanel>
          <FormField
            accessibilityHint="Enter the email attached to your VEX account"
            accessibilityLabel="Account email"
            autoCapitalize="none"
            autoComplete="email"
            error={errors.email}
            keyboardType="email-address"
            label="Email"
            leftIcon="email"
            onChangeText={(value) => {
              setEmail(value);
              if (errors.email) {
                setErrors((prev) => ({ ...prev, email: undefined }));
              }
            }}
            placeholder="you@example.com"
            returnKeyType="next"
            size="lg"
            value={email}
          />
          <FormField
            accessibilityHint="Enter your VEX account password"
            accessibilityLabel="Account password"
            autoComplete="password"
            containerStyle={{ marginBottom: 0 }}
            error={errors.password}
            label="Password"
            leftIcon="lock"
            onChangeText={(value) => {
              setPassword(value);
              if (errors.password) {
                setErrors((prev) => ({ ...prev, password: undefined }));
              }
            }}
            onSubmitEditing={() => {
              handleLogin();
            }}
            placeholder="Your password"
            returnKeyType="done"
            secureTextEntry
            size="lg"
            value={password}
          />
        </AuthCommandPanel>
      </Animated.View>

      <Animated.View entering={actionEntering}>
        <Pressable
          accessibilityHint="Opens password recovery"
          accessibilityLabel="Forgot password"
          accessibilityRole="link"
          onPress={() =>
            navigation.navigate({ name: 'ForgotPassword', params: undefined })
          }
          style={[
            getMinTouchTargetStyle(),
            {
              alignSelf: 'flex-end',
              marginBottom: theme.spacing[5],
              marginTop: theme.spacing[3],
            },
          ]}
        >
          <Text color="vexCyan" variant="caption">
            Forgot password?
          </Text>
        </Pressable>
        <Button
          fullWidth
          isLoading={isLoading}
          onPress={() => {
            handleLogin();
          }}
          size="lg"
          variant="primary"
        >
          Sign In
        </Button>
        <Box
          flexDirection="row"
          justifyContent="center"
          mt="lg"
          style={{ gap: theme.spacing[1] }}
        >
          <Text color="text.secondary" variant="body">
            Don't have an account?
          </Text>
          <Pressable
            accessibilityHint="Creates a new VEX account"
            accessibilityLabel="Create a VEX account"
            accessibilityRole="link"
            onPress={() =>
              navigation.navigate({ name: 'Register', params: undefined })
            }
            style={getMinTouchTargetStyle()}
          >
            <Text color="vexCyan" fontWeight="700" variant="body">
              Sign up
            </Text>
          </Pressable>
        </Box>
      </Animated.View>

      {__DEV__ ? (
        <Animated.View
          entering={
            isReducedMotion ? undefined : FadeInDown.delay(320).duration(420)
          }
        >
          <View
            style={{
              borderTopColor: theme.colors.semantic.border,
              borderTopWidth: 1,
              gap: theme.spacing[3],
              marginTop: theme.spacing[8],
              paddingTop: theme.spacing[5],
            }}
          >
            <Button
              onPress={() => Sentry.captureException(new Error('First error'))}
              variant="outline"
            >
              Test Sentry
            </Button>
          </View>
        </Animated.View>
      ) : null}
    </AppScreen>
  );
};

export default withScreenErrorBoundary(LoginScreen, 'Login');
