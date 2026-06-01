import { useMutation, type UseMutationResult } from '@tanstack/react-query';
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
    onSuccess: () => {
      showToast({
        message: 'Your account and local data were deleted.',
        type: 'success',
        duration: 5000,
      });
    },
  });
  return { ...mutation, deleteAccountAsync: mutation.mutateAsync };
}
