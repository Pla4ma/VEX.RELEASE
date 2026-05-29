import { getSupabaseClient } from "../../config/supabase";
import type { PostgrestError } from "@supabase/supabase-js";

export class RepositoryError extends Error {
  public readonly operation: string;
  public readonly cause: PostgrestError | Error;

  constructor(operation: string, cause: PostgrestError | Error) {
    super(`Repository operation "${operation}" failed: ${cause.message}`);
    this.name = "RepositoryError";
    this.operation = operation;
    this.cause = cause;
  }
}

export function getSupabase() {
  return getSupabaseClient();
}
