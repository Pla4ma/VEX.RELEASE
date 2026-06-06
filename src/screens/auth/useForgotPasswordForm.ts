import { useState, useCallback } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { forgotPasswordSchema } from './schemas';
import { resetPassword } from '../../features/auth/service';
import { captureException } from '../../config/sentry';
import { useToast } from '../../shared/ui/components/Toast';
import type { AuthStackParams } from '../../navigation';

type Navigation = NativeStackScreenProps<
  AuthStackParams,
  'ForgotPassword'
>['navigation'];

export function useForgotPasswordForm(navigation: Navigation) {
  const { show: showToast } = useToast();

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = useCallback(async () => {
    setError(undefined);
    setIsLoading(true);

    const parseResult = forgotPasswordSchema.safeParse({ email });
    if (!parseResult.success) {
      setError('Please enter a valid email address');
      showToast({
        type: 'error',
        title: 'Failed to send email',
        message: 'Please enter a valid email address',
        duration: 4000,
      });
      setIsLoading(false);
      return;
    }

    try {
      const { error: resetError } = await resetPassword(email.trim());

      if (resetError) {
        setError(resetError.message);
        showToast({
          type: 'error',
          title: 'Failed to send email',
          message: resetError.message,
          duration: 4000,
        });
        setIsLoading(false);
        return;
      }
    } catch (err) {
      captureException(err instanceof Error ? err : new Error(String(err)), {
        tags: { feature: 'forgot-password' },
      });
      setError('Something went wrong. Please try again.');
      showToast({
        type: 'error',
        title: 'Failed to send email',
        message: 'Something went wrong. Please try again.',
        duration: 4000,
      });
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    setIsSuccess(true);
    showToast({
      type: 'success',
      title: 'Email sent',
      message: 'Check your inbox for reset instructions.',
      duration: 4000,
    });
  }, [email, showToast]);

  const handleBack = useCallback(() => {
    navigation.navigate({ name: 'Login', params: {} });
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
