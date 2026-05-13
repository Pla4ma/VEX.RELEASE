import { z } from "zod";
import { createDebugger } from "../../utils/debug";


export const SessionValidationSchema = z.object({
  name: SessionNameSchema.optional(),
  duration: SessionDurationSchema,
  intervals: IntervalSchema,
  breakDuration: z.number().min(0).max(3600),
  strictMode: z.boolean(),
  dndEnabled: z.boolean(),
  autoStartBreaks: z.boolean(),
  tags: z.array(z.string().max(30)).max(10),
  goal: z.string().max(500).optional(),
});

export function validateSessionConfig(
  config: unknown
): ValidationResult<SessionValidationInput> {
  const result: ValidationResult<SessionValidationInput> = {
    success: false,
    errors: [],
    warnings: [],
  };

  try {
    const parsed = SessionValidationSchema.parse(config);
    result.data = parsed;
    result.success = true;

    // Additional logical validations
    const logicalWarnings = performLogicalValidation(parsed);
    result.warnings = logicalWarnings;

    debug.info('Session config validated successfully', { name: parsed.name });
  } catch (error) {
    if (error instanceof z.ZodError) {
      result.errors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code,
        value: err.path.reduce<unknown>((obj, key) =>
          obj && typeof obj === 'object' ? (obj as Record<string, unknown>)[key] : undefined,
          config
        ),
      }));
    } else {
      result.errors.push({
        field: 'unknown',
        message: String(error),
        code: 'UNKNOWN_ERROR',
      });
    }

    debug.warn('Session config validation failed', { errors: result.errors });
  }

  return result;
}

export function validateSessionStart(
  config: unknown,
  userState: {
    isAuthenticated: boolean;
    hasActiveSession: boolean;
    networkStatus: 'online' | 'offline';
    dailySessionCount: number;
    maxDailySessions?: number;
  }
): ValidationResult<SessionValidationInput> {
  const result = validateSessionConfig(config);

  if (!result.success) {return result;}

  // Check user state constraints
  if (!userState.isAuthenticated) {
    result.success = false;
    result.errors.push({
      field: 'user',
      message: 'User must be authenticated to start a session',
      code: 'NOT_AUTHENTICATED',
    });
  }

  if (userState.hasActiveSession) {
    result.success = false;
    result.errors.push({
      field: 'session',
      message: 'User already has an active session',
      code: 'ACTIVE_SESSION_EXISTS',
    });
  }

  if (userState.networkStatus === 'offline') {
    result.warnings.push({
      field: 'network',
      message: 'Offline mode: Session will sync when connection restored',
      code: 'OFFLINE_MODE',
    });
  }

  const maxSessions = userState.maxDailySessions || 50;
  if (userState.dailySessionCount >= maxSessions) {
    result.warnings.push({
      field: 'dailyLimit',
      message: `You've reached ${userState.dailySessionCount} sessions today. Consider quality over quantity.`,
      code: 'DAILY_SESSION_LIMIT',
    });
  }

  return result;
}

export function validateSessionPause(
  sessionState: {
    status: string;
    elapsedTime: number;
    pauseCount: number;
    strictMode: boolean;
  }
): ValidationResult<void> {
  const result: ValidationResult<void> = {
    success: true,
    errors: [],
    warnings: [],
  };

  if (sessionState.status !== 'ACTIVE') {
    result.success = false;
    result.errors.push({
      field: 'status',
      message: `Cannot pause session in ${sessionState.status} state`,
      code: 'INVALID_STATUS_FOR_PAUSE',
    });
  }

  if (sessionState.strictMode) {
    result.warnings.push({
      field: 'strictMode',
      message: 'Strict mode is enabled. Pausing will affect your purity score.',
      code: 'STRICT_MODE_PAUSE',
    });
  }

  if (sessionState.pauseCount >= 5) {
    result.warnings.push({
      field: 'pauseCount',
      message: `You've paused ${sessionState.pauseCount} times. Frequent pauses reduce session quality.`,
      code: 'EXCESSIVE_PAUSES',
    });
  }

  if (sessionState.elapsedTime < 60) {
    result.warnings.push({
      field: 'elapsedTime',
      message: 'Pausing very early in session may indicate focus issues',
      code: 'EARLY_PAUSE',
    });
  }

  return result;
}