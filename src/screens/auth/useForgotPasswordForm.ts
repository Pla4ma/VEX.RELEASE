import { useState, useCallback } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { submitForgotPassword } from "./forgot-password-helpers";
import { useToast } from "../../shared/ui/components/Toast";
import type { AuthStackParams } from "../../navigation";

type Navigation = NativeStackScreenProps<
  AuthStackParams,
  "ForgotPassword"
>["navigation"];

export function useForgotPasswordForm(navigation: Navigation) {
  const { show: showToast } = useToast();

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = useCallback(async () => {
    setError(undefined);
    setIsLoading(true);

    const result = await submitForgotPassword(email);

    if (!result.success) {
      setError(result.error);
      showToast({
        type: "error",
        title: "Failed to send email",
        message: result.error ?? "Unknown error",
        duration: 4000,
      });
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    setIsSuccess(true);
    showToast({
      type: "success",
      title: "Email sent",
      message: "Check your inbox for reset instructions.",
      duration: 4000,
    });
  }, [email, showToast]);

  const handleBack = useCallback(() => {
    navigation.navigate({ name: "Login", params: {} });
  }, [navigation]);

  return {
    email,
    setEmail,
    error,
    setError,
    isLoading,
    isSuccess,
    handleSubmit,
    handleBack,
  };
}
