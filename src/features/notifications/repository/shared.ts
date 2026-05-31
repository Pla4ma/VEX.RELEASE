export class RepositoryError extends Error {
  constructor(
    public operation: string,
    public originalError: unknown,
  ) {
    super(
      `Repository error in ${operation}: ${
        originalError instanceof Error ? originalError.message : 'Unknown error'
      }`,
    );
    this.name = 'RepositoryError';
  }
}

/** Re-export singleton from canonical source to avoid stale module-level references */
export { supabase } from '../../../config/supabase';
