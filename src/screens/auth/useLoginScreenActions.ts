import { useCallback, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { useOnboardingStore } from '../../features/onboarding/store';
import { useAuthStore } from '../../store';
import type { EtherealAuthProvider } from './components/ethereal';
import type { LoginScreenProps } from './LoginScreen.types';
import { DEV_BYPASS_USER_ID, createDevBypassUser } from './LoginScreen.devBypass';

const OAUTH_PROVIDER_MAP: Record<EtherealAuthProvider, 'apple' | 'google' | null> = {
  apple: 'apple',
  google: 'google',
  email: null,
};

interface LoginErrors {
  email?: string;
  password?: string;
}

interface UseLoginScreenActionsInput {
  navigation: LoginScreenProps['navigation'];
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  errors: LoginErrors;
  setErrors: Dispatch<SetStateAction<LoginErrors>>;
  handleOAuthLogin: (provider: 'apple' | 'google') => Promise<void>;
}

export function useLoginScreenActions({
  navigation,
  setEmail,
  setPassword,
  errors,
  setErrors,
  handleOAuthLogin,
}: UseLoginScreenActionsInput) {
  const [showEmailForm, setShowEmailForm] = useState(false);

  const onChangeEmail = useCallback((value: string) => {
    setEmail(value);
    if (errors.email) {
      setErrors((current) => ({ ...current, email: undefined }));
    }
  }, [errors.email, setEmail, setErrors]);

  const onChangePassword = useCallback((value: string) => {
    setPassword(value);
    if (errors.password) {
      setErrors((current) => ({ ...current, password: undefined }));
    }
  }, [errors.password, setPassword, setErrors]);

  const onProviderPress = useCallback(
    (provider: EtherealAuthProvider) => {
      const mapped = OAUTH_PROVIDER_MAP[provider];
      if (provider === 'email') {
        setShowEmailForm(true);
        return;
      }
      if (mapped) {
        handleOAuthLogin(mapped).catch(() => undefined);
      }
    },
    [handleOAuthLogin],
  );

  const onForgotPassword = useCallback(() => {
    navigation.navigate({ name: 'ForgotPassword', params: undefined });
  }, [navigation]);

  const onCreateAccount = useCallback(() => {
    navigation.navigate({ name: 'Register', params: undefined });
  }, [navigation]);

  const onSkipLogin = useCallback(() => {
    useAuthStore.getState().login(createDevBypassUser());
    useOnboardingStore.getState().completeOnboarding(DEV_BYPASS_USER_ID);
  }, []);

  return {
    showEmailForm,
    onChangeEmail,
    onChangePassword,
    onProviderPress,
    onForgotPassword,
    onCreateAccount,
    onSkipLogin,
  };
}
