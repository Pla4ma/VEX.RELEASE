import { z } from "zod";

import { captureSilentFailure } from "../utils/silent-failure";

interface PersistedJsonContext {
  feature: string;
  key: string;
}

export function safeJsonParse<T = unknown>(
  raw: string,
  context: PersistedJsonContext,
): T | null {
  try {
    const parsed = JSON.parse(raw);
    return parsed;
  } catch (error) {
    captureSilentFailure(error, {
      feature: context.feature,
      operation: "safe-fallback",
      type: "data",
    });
    return null;
  }
}

export function parseJsonWithSchema<TSchema extends z.ZodTypeAny>(
  raw: string,
  schema: TSchema,
  context: PersistedJsonContext,
): z.infer<TSchema> | null {
  const parsedJson = safeJsonParse(raw, context);
  if (parsedJson === null) {
    return null;
  }

  const parsedSchema = schema.safeParse(parsedJson);
  if (!parsedSchema.success) {
    captureSilentFailure(parsedSchema.error, {
      feature: context.feature,
      operation: "safe-fallback",
      type: "data",
    });
    return null;
  }

  return parsedSchema.data;
}

export function stringifyJsonSafe(
  value: unknown,
  context: PersistedJsonContext,
): string | null {
  try {
    return JSON.stringify(value);
  } catch (error) {
    captureSilentFailure(error, {
      feature: context.feature,
      operation: "safe-fallback",
      type: "data",
    });
    return null;
  }
}
