import { withScreenErrorBoundary } from "../../shared/ui/components/ScreenErrorBoundary";
import React, { useCallback, useState } from "react";
import { Pressable, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as Sentry from "@sentry/react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import {
  AppScreen,
  Box,
  Button,
  Card,
  Text,
} from "../../components/primitives";
import { AuthValuePreview } from "./components/AuthValuePreview";
import { FormField } from "../../shared/ui/components/FormField";
import { useToast } from "../../shared/ui/components/Toast";
import { useAuthStore } from "../../store/index";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { useTheme } from "../../theme";
import { getMinTouchTargetStyle } from "../../utils/touchTarget";
import { loginSchema } from "../../validation";
import type { AuthStackParams } from "../../navigation";

type Props = NativeStackScreenProps<AuthStackParams, "Login">;
type LoginErrors = { email?: string; password?: string };

export const LoginScreen: React.FC<Props> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { isReducedMotion } = useReducedMotion();
  const { loginWithCredentials, isLoading } = useAuthStore();
  const { show: showToast } = useToast();
  const [email, setEmail] = useState(route.params?.email ?? "");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginErrors>({});
  const introEntering = isReducedMotion
    ? undefined
    : FadeInDown.delay(0).duration(420);
  const bodyEntering = isReducedMotion
    ? undefined
    : FadeInDown.delay(120).duration(420);
  const actionEntering = isReducedMotion
    ? undefined
    : FadeInDown.delay(220).duration(420);

  const handleLogin = useCallback(async (): Promise<void> => {
    const result = loginSchema.safeParse({
      email,
      password,
      rememberMe: false,
    });
    if (!result.success) {
      const fieldErrors: LoginErrors = {};
      result.error.errors.forEach((err) => {
        const path = err.path[0];
        if (path === "email" || path === "password") {
          fieldErrors[path] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    const success = await loginWithCredentials(email, password);
    if (!success) {
      showToast({
        duration: 4000,
        message: "Check your email and password, then try again.",
        title: "Sign in failed",
        type: "error",
      });
    }
  }, [email, loginWithCredentials, password, showToast]);

  return (
    <AppScreen keyboardAvoiding contentStyle={{ gap: theme.spacing[5] }}>
      <Animated.View entering={introEntering}>
        <Text color="primary.300" textAlign="center" variant="label">
          VEX Command
        </Text>
        <Text color="text.primary" textAlign="center" variant="display">
          VEX
        </Text>
        <Text color="text.secondary" mt="sm" textAlign="center" variant="body">
          Protect one block. Leave with proof.
        </Text>
      </Animated.View>

      <Animated.View entering={bodyEntering}>
        <AuthValuePreview />
      </Animated.View>

      <Animated.View entering={bodyEntering}>
        <Card size="lg" variant="glass">
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
              void handleLogin();
            }}
            placeholder="Your password"
            returnKeyType="done"
            secureTextEntry
            size="lg"
            value={password}
          />
        </Card>
      </Animated.View>

      <Animated.View entering={actionEntering}>
        <Pressable
          accessibilityHint="Opens password recovery"
          accessibilityLabel="Forgot password"
          accessibilityRole="link"
          onPress={() =>
            navigation.navigate({ name: "ForgotPassword", params: undefined })
          }
          style={[
            getMinTouchTargetStyle(),
            {
              alignSelf: "flex-end",
              marginBottom: theme.spacing[5],
              marginTop: theme.spacing[3],
            },
          ]}
        >
          <Text color="primary.300" variant="caption">
            Forgot password?
          </Text>
        </Pressable>
        <Button
          fullWidth
          isLoading={isLoading}
          onPress={() => {
            void handleLogin();
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
              navigation.navigate({ name: "Register", params: undefined })
            }
            style={getMinTouchTargetStyle()}
          >
            <Text color="primary.300" fontWeight="700" variant="body">
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
              onPress={() => Sentry.captureException(new Error("First error"))}
              variant="outline"
            >
              Test Sentry
            </Button>
            <Text color="text.muted" textAlign="center" variant="caption">
              Development controls
            </Text>
          </View>
        </Animated.View>
      ) : null}
    </AppScreen>
  );
};

export default withScreenErrorBoundary(LoginScreen, "Login");
