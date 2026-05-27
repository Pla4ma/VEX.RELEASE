import type { z } from "zod";
import type { Database } from "../../types/supabase";
import type {
  CompanionPromiseHomeStateSchema,
  CompanionPromiseLifecycleResultSchema,
  CompanionPromiseSchema,
  CompletedSessionPromiseInputSchema,
  CreateCompanionPromiseInputSchema,
} from "./schemas";

export type CompanionPromise = z.infer<typeof CompanionPromiseSchema>;
export type CompanionPromiseHomeState = z.infer<
  typeof CompanionPromiseHomeStateSchema
>;
export type CompanionPromiseLifecycleResult = z.infer<
  typeof CompanionPromiseLifecycleResultSchema
>;
export type CompletedSessionPromiseInput = z.infer<
  typeof CompletedSessionPromiseInputSchema
>;
export type CreateCompanionPromiseInput = z.infer<
  typeof CreateCompanionPromiseInputSchema
>;
export type CompanionPromiseRow =
  Database["public"]["Tables"]["companion_promises"]["Row"];
export type CompanionPromiseInsert =
  Database["public"]["Tables"]["companion_promises"]["Insert"];
export type CompanionPromiseUpdate =
  Database["public"]["Tables"]["companion_promises"]["Update"];
