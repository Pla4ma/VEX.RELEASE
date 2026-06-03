import { forgotPasswordSchema } from './schemas';
import { resetPassword } from '../../features/auth/service';
import { captureException } from '../../config/sentry';

export interface ForgotPasswordResult {
  success: boolean;
  error?: string;
}

export async function submitForgotPassword(
  email: string,
): Promise<ForgotPasswordResult> {
  const result = forgotPasswordSchema.safeParse({ email });
  if (!result.success) {
    return { success: false, error: 'Please enter a valid email address' };
  }

  try {
    const { error: resetError } = await resetPassword(email.trim());

    if (resetError) {
      return { success: false, error: resetError.message };
    }

    return { success: true };
  } catch (err) {
    captureException(err instanceof Error ? err : new Error(String(err)), {
      tags: { feature: 'forgot-password' },
    });
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
}
