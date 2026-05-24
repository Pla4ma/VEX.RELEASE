import { getSupabaseClient } from '../../config/supabase';

export class AccountDeletionRepositoryError extends Error {
  constructor(public operation: string, public cause: unknown) {
    super(`Account deletion repository failed during ${operation}: ${cause instanceof Error ? cause.message : String(cause)}`);
    this.name = 'AccountDeletionRepositoryError';
  }
}

export async function deleteCurrentUser(): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.rpc('delete_current_user');
  if (error) {throw new AccountDeletionRepositoryError('deleteCurrentUser', error);}
}

export async function signOutCurrentSession(): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.signOut();
  if (error) {throw new AccountDeletionRepositoryError('signOutCurrentSession', error);}
}
