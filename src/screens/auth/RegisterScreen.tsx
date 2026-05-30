import React, { useCallback, useMemo, useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Pressable } from "react-native";

import { AppScreen, Box, Button, Text } from "../../components/primitives";
import type { AuthStackParams } from "../../navigation";
import { withScreenErrorBoundary } from "../../shared/ui/components/ScreenErrorBoundary";
import { FormField } from "../../shared/ui/components/FormField";
import { useToast } from "../../shared/ui/components/Toast";
import { useAuthStore } from "../../store/index";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { useTheme } from "../../theme";
import { getMinTouchTargetStyle } from "../../utils/touchTarget";
import { registerSchema, type RegisterFormData } from "./schemas";
import { AuthValuePreview } from "./components/AuthValuePreview";

type Props = NativeStackScreenProps<AuthStackParams, "Register">;
type RegisterErrors = Partial<Record<keyof RegisterFormData, string>>;

function getFieldError(
  errors: RegisterErrors,
  field: keyof RegisterFormData,
): string | undefined {
  return errors[field];
}

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const { isReducedMotion } = useReducedMotion();
  const { register, isLoading } = useAuthStore();
  const { show: showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<RegisterErrors>({});
  const entering = useMemo(
    () => (isReducedMotion ? undefined : FadeInDown.duration(420)),
    [isReducedMotion],
  );

  const clearError = useCallback(
    (field: keyof RegisterFormData): void => {
      if (errors[field]) {
        setErrors((previous) => ({ ...previous, [field]: undefined }));
      }
    },
    [errors],
  );

  const handleRegister = useCallback(async (): Promise<void> => {
    const result = registerSchema.safeParse({
      agreeToTerms: true,
      confirmPassword: password,
      email,
      firstName: "",
      lastName: "",
      password,
    });

    if (!result.success) {
      const fieldErrors: RegisterErrors = {};
      result.error.errors.forEach((error) => {
        const field = error.path[0];
        if (
          field === "email" ||
          field === "password" ||
          field === "confirmPassword"
        ) {
          fieldErrors[field] = error.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    const success = await register(result.data);
    if (!success) {
      showToast({
        duration: 4000,
        message: "Your account did not land. Check the details and try again.",
        title: "Signup did not finish",
        type: "error",
      });
    }
  }, [email, password, register, showToast]);

  return (
    <AppScreen keyboardAvoiding contentStyle={{ gap: theme.spacing[5] }}>
      <Animated.View entering={entering}>
        <Text color="primary.300" textAlign="center" variant="label">
          Start with the loop
        </Text>
        <Text color="text.primary" textAlign="center" variant="h1">
          Create your VEX account
        </Text>
        <Text color="text.secondary" mt="sm" textAlign="center" variant="body">
          Two fields, then your first protected session.
        </Text>
      </Animated.View>

      <Animated.View entering={entering}>
        <AuthValuePreview />
      </Animated.View>

      <Animated.View entering={entering}>
        <FormField
          accessibilityHint="Enter the email you want to use for VEX"
          accessibilityLabel="Account email"
          autoCapitalize="none"
          autoComplete="email"
          error={getFieldError(errors, "email")}
          keyboardType="email-address"
          label="Email"
          leftIcon="email"
          onChangeText={(value) => {
            setEmail(value);
            clearError("email");
          }}
          placeholder="you@example.com"
          returnKeyType="next"
          size="lg"
          value={email}
        />
        <FormField
          accessibilityHint="Create a password for your VEX account"
          accessibilityLabel="Account password"
          autoComplete="new-password"
          error={getFieldError(errors, "password")}
          helperText="Use 8+ characters with a number and symbol."
          label="Password"
          leftIcon="lock"
          onChangeText={(value) => {
            setPassword(value);
            clearError("password");
          }}
          onSubmitEditing={() => {
            void handleRegister();
          }}
          placeholder="Create a password"
          returnKeyType="done"
          secureTextEntry
          size="lg"
          value={password}
        />
        <Text color="text.muted" variant="caption">
          By creating an account, you agree to the Terms of Service and Privacy
          Policy.
        </Text>
      </Animated.View>

      <Animated.View entering={entering}>
        <Button
          accessibilityHint="Creates your VEX account and continues to onboarding"
          accessibilityLabel="Create VEX account"
          fullWidth
          isLoading={isLoading}
          onPress={() => {
            void handleRegister();
          }}
          size="lg"
          variant="primary"
        >
          Create account
        </Button>

        <Box
          flexDirection="row"
          justifyContent="center"
          mt="lg"
          style={{ gap: theme.spacing[1] }}
        >
          <Text color="text.secondary" variant="body">
            Already have an account?
          </Text>
          <Pressable
            accessibilityHint="Returns to sign in"
            accessibilityLabel="Sign in to an existing VEX account"
            accessibilityRole="link"
            onPress={() => navigation.navigate({ name: "Login", params: {} })}
            style={getMinTouchTargetStyle()}
          >
            <Text color="primary.300" fontWeight="700" variant="body">
              Sign in
            </Text>
          </Pressable>
        </Box>
      </Animated.View>
    </AppScreen>
  );
};

export default withScreenErrorBoundary(RegisterScreen, "Register");
