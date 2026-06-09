import { z } from 'zod';
import { createDebugger } from '../../utils/debug';
import type { ValidationResult, ValidationWarning } from './validation-types';

const debug = createDebugger('session:validation');

const SessionDurationSchema = z
  .number()
  .min(60, 'Session must be at least 1 minute')
  .max(86400, 'Session cannot exceed 24 hours');
const SessionNameSchema = z
  .string()
  .min(1, 'Session name is required')
  .max(100, 'Session name must be 100 characters or less');
const IntervalSchema = z
  .number()
  .int()
  .min(1, 'Must have at least 1 interval')
  .max(20, 'Cannot exceed 20 intervals');

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

export type SessionValidationInput = z.infer<typeof SessionValidationSchema>;

/** Safely traverse a nested object by path segments to retrieve a value. */
function getPathValue(
  root: unknown,
  path: Array<string | number>,
): unknown {
  let current: unknown = root;
  for (const key of path) {
    if (current !== null && typeof current === 'object') {
      current = (current as Record<string, unknown>)[key as string];
    } else {
      return undefined;
    }
  }
  return current;
}

export function validateSessionConfig(
  config: unknown,
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
    const logicalWarnings = performLogicalValidation(parsed);
    result.warnings = logicalWarnings;
    debug.info('Session config validated successfully', { name: parsed.name });
  } catch (error) {
    if (error instanceof z.ZodError) {
      result.errors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code,
        value: getPathValue(config, err.path),
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

function performLogicalValidation(
  config: SessionValidationInput,
): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];
  if (config.duration > 7200 && !config.breakDuration) {
    warnings.push({
      field: 'breakDuration',
      message:
        'Sessions over 2 hours should include breaks to maintain focus quality',
      code: 'LONG_SESSION_NO_BREAK',
    });
  }
  const avgIntervalDuration = config.duration / config.intervals;
  if (config.intervals > 4 && avgIntervalDuration < 600) {
    warnings.push({
      field: 'intervals',
      message: `Short intervals (${Math.floor(avgIntervalDuration / 60)}m each) may reduce deep focus quality`,
      code: 'SHORT_INTERVALS',
    });
  }
  if (config.strictMode && !config.dndEnabled) {
    warnings.push({
      field: 'dndEnabled',
      message: 'Strict mode works best with Do Not Disturb enabled',
      code: 'STRICT_WITHOUT_DND',
    });
  }
  if (config.autoStartBreaks && config.breakDuration < 300) {
    warnings.push({
      field: 'breakDuration',
      message:
        'Auto-starting with short breaks may not provide adequate recovery',
      code: 'SHORT_AUTO_BREAKS',
    });
  }
  return warnings;
}
