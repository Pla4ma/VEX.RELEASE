/**
 * Forgot Password Screen
 *
 * Premium password recovery flow with Supabase email verification.
 */

import React from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, { FadeInDown } from "react-native-reanimated";

import { withScreenErrorBoundary } from "../../shared/ui/components/ScreenErrorBoundary";
import { useTheme } from "../../theme";
import { Box, Text } from "../../components/primitives";
import { Button } from "../../components";
import { Icon } from "../../icons";
import { FormField } from "../../shared/ui/components/FormField";
import type { AuthStackParams } from "../../navigation";
import { useForgotPasswordForm } from "./useForgotPasswordForm";

type Props = NativeStackScreenProps<AuthStackParams, "ForgotPassword">;

export const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { email, setEmail, error, setError, isLoading, isSuccess, handleSubmit, handleBack } =
    useForgotPasswordForm(navigation);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: theme.colors.background.primary }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: insets.bottom + 20,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Box flex={1} px="xl" py="2xl">
          {/* Back Button */}
          <Animated.View entering={FadeInDown.delay(0).duration(600)}>
            <Button
              variant="ghost"
              size="sm"
              onPress={handleBack}
              leftIcon={
                <Icon
                  name="back"
                  size="sm"
                  color={theme.colors.text.secondary}
                />
              }
              style={{ alignSelf: "flex-start", marginBottom: 24 }}
              accessibilityLabel="Back to Login button"
              accessibilityRole="button"
              accessibilityHint="Activates this control"
            >
              Back to Login
            </Button>
          </Animated.View>

          {/* Header */}
          <Animated.View entering={FadeInDown.delay(100).duration(600)}>
            <Box alignItems="center" mb="xl">
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 24,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: theme.colors.primary[50],
                }}
              >
                <Icon
                  name="lock"
                  size="2xl"
                  color={theme.colors.primary[500]}
                />
              </View>
              <Text variant="h1" textAlign="center" mt="lg">
                {isSuccess ? "Email Sent!" : "Reset Password"}
              </Text>
              <Text
                variant="body"
                color="text.secondary"
                textAlign="center"
                mt="sm"
              >
                {isSuccess
                  ? `We've sent password reset instructions to ${email}`
                  : "Enter your email and we will send you instructions to reset your password"}
              </Text>
            </Box>
          </Animated.View>

          {/* Success State */}
          {isSuccess ? (
            <Animated.View entering={FadeInDown.delay(200).duration(600)}>
              <Box alignItems="center">
                <View
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: 48,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: theme.colors.success.light + "30",
                  }}
                >
                  <Icon
                    name="check"
                    size="3xl"
                    color={theme.colors.success.DEFAULT}
                  />
                </View>
                <Button
                  variant="primary"
                  onPress={handleBack}
                  fullWidth
                  style={{ marginTop: 32 }}
                  accessibilityLabel="Back to Login button"
                  accessibilityRole="button"
                  accessibilityHint="Activates this control"
                >
                  Back to Login
                </Button>
              </Box>
            </Animated.View>
          ) : (
            <Animated.View entering={FadeInDown.delay(200).duration(600)}>
              {/* Form */}
              <Box gap="lg">
                <FormField
                  label="Email Address"
                  value={email}
                  onChangeText={(value) => {
                    setEmail(value);
                    if (error) {
                      setError(undefined);
                    }
                  }}
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  leftIcon="email"
                  size="lg"
                  error={error}
                  editable={!isLoading}
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                />

                {/* Submit button */}
                <Button
                  variant="primary"
                  size="lg"
                  onPress={handleSubmit}
                  isLoading={isLoading}
                  disabled={isLoading || !email}
                  fullWidth
                  accessibilityLabel="Send Reset Link button"
                  accessibilityRole="button"
                  accessibilityHint="Activates this control"
                >
                  Send Reset Link
                </Button>
              </Box>

              {/* Help text */}
              <Box alignItems="center" mt="xl">
                <Text
                  variant="caption"
                  color="text.tertiary"
                  textAlign="center"
                >
                  Did not receive the email? Check your spam folder or try
                  again.
                </Text>
              </Box>
            </Animated.View>
          )}
        </Box>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default withScreenErrorBoundary(ForgotPasswordScreen, "ForgotPassword");
