import { getSupabaseClient } from "../../../config/supabase";

export class RepositoryError extends Error {
  constructor(
    public operation: string,
    public originalError: unknown,
  ) {
    super(
      `Repository error in ${operation}: ${
        originalError instanceof Error ? originalError.message : "Unknown error"
      }`,
    );
    this.name = "RepositoryError";
  }
}

export const supabase = getSupabaseClient();
