import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { useUIStore } from '../../store/index';
import { captureAccountDeletionError } from './analytics';
import { deleteAccount } from './service';
import type { AccountDeletionInput, AccountDeletionResult } from './schemas';

export function useDeleteAccount(): UseMutationResult<
  AccountDeletionResult,
  Error,
  AccountDeletionInput
> & {
  deleteAccountAsync: (
    input: AccountDeletionInput,
  ) => Promise<AccountDeletionResult>;
} {
  const showToast = useUIStore((state) => state.showToast);
  const queryClient = useQueryClient();
  const mutation = useMutation<
    AccountDeletionResult,
    Error,
    AccountDeletionInput
  >({
    mutationFn: deleteAccount,
    onError: (error) => {
      captureAccountDeletionError(error, 'deleteAccountMutation');
      showToast({
        message: 'Account deletion failed. Try again or contact support.',
        type: 'error',
        duration: 5000,
      });
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries();
      const cleanupCompleted =
        result.localStorageCleared &&
        result.secureStorageCleared &&
        result.sessionSignedOut &&
        result.sentryIdentityCleared &&
        result.monetizationSignedOut;
      showToast({
        message: cleanupCompleted
          ? 'Your account and local data were deleted.'
          : 'Your account was deleted, but some local cleanup could not be completed.',
        type: cleanupCompleted ? 'success' : 'error',
        duration: 5000,
      });
    },
  });
  return { ...mutation, deleteAccountAsync: mutation.mutateAsync };
}
