import { z } from 'zod';

export const AppErrorCodeSchema = z.enum([
  'auth',
  'validation',
  'network',
  'persistence',
  'conflict',
  'quota',
  'provider_unavailable',
  'configuration',
]);

export const VexAppErrorSchema = z
  .object({
    code: AppErrorCodeSchema,
    operation: z.string().min(1),
    message: z.string().min(1),
    userMessage: z.string().min(1),
    retryable: z.boolean(),
    causeCode: z.string().min(1).nullable(),
    details: z.record(z.string(), z.unknown()),
  })
  .strict();

export type AppErrorCode = z.infer<typeof AppErrorCodeSchema>;
export type VexAppError = z.infer<typeof VexAppErrorSchema>;

const USER_MESSAGES: Record<AppErrorCode, string> = {
  auth: 'VEX could not verify your account. Please sign in again.',
  validation: 'Check the details and try again.',
  network: 'VEX could not connect. Try again.',
  persistence: 'VEX could not save that yet. Try again.',
  conflict: 'That changed elsewhere. Refresh and try again.',
  quota: 'That VEX limit has been reached for now.',
  provider_unavailable: 'VEX is thinking locally for now. Try again soon.',
  configuration: 'VEX is missing a required setup. Try again later.',
};

const RETRYABLE_CODES: Partial<Record<AppErrorCode, true>> = {
  network: true,
  persistence: true,
  conflict: true,
  provider_unavailable: true,
};

export function createAppError(
  code: AppErrorCode,
  operation: string,
  cause: unknown,
  details: Record<string, unknown> = {},
): VexAppError {
  const message = cause instanceof Error ? cause.message : String(cause);
  return VexAppErrorSchema.parse({
    code,
    operation,
    message: message || 'Unknown failure',
    userMessage: USER_MESSAGES[code],
    retryable: RETRYABLE_CODES[code] === true,
    causeCode: cause instanceof Error && 'code' in cause
      ? typeof cause.code === 'string'
        ? cause.code
        : null
      : null,
    details,
  });
}
