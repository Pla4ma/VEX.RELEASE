import { useCallback, useState } from 'react';
import { FadeInDown } from 'react-native-reanimated';
import { useToast } from '../../shared/ui/components/Toast';
import { useAuthStore } from '../../store/index';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { loginSchema } from './schemas';

type LoginErrors = { email?: string; password?: string };

export function useLoginScreen(initialEmail: string) {
  const { isReducedMotion } = useReducedMotion();
  const { loginWithCredentials, isLoading } = useAuthStore();
  const { show: showToast } = useToast();
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
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
        if (path === 'email' || path === 'password') {
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
        message: 'Check your email and password, then try again.',
        title: 'Sign in failed',
        type: 'error',
      });
    }
  }, [email, loginWithCredentials, password, showToast]);

  return {
    actionEntering,
    bodyEntering,
    email,
    errors,
    handleLogin,
    introEntering,
    isLoading,
    password,
    setErrors,
    setEmail,
    setPassword,
  };
}
