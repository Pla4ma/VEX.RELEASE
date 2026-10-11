import { z } from "https://esm.sh/zod@3.22.4";
import type {
  Database as GeneratedDatabase,
  Json,
} from "../../../src/types/supabase.ts";

export const ContentStudyJsonSchema: z.ZodType<Json> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(ContentStudyJsonSchema),
    z.record(z.string(), ContentStudyJsonSchema),
  ])
);

export type ContentStudyDatabase = GeneratedDatabase;

export function normalizeStudyContentJson(value: unknown): Json {
  const serialized = JSON.stringify(value);
  if (serialized === undefined) {
    throw new Error("Study data is not JSON serializable");
  }
  const parsed: unknown = JSON.parse(serialized);
  return ContentStudyJsonSchema.parse(parsed);
}
