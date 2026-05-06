/**
 * Squad Domain Errors
 *
 * Rich error hierarchy with recovery hints.
 */

export type SquadErrorCode =
  | 'SQUAD_NOT_FOUND'
  | 'SQUAD_FULL'
  | 'MEMBER_NOT_FOUND'
  | 'INSUFFICIENT_PERMISSIONS'
  | 'INVALID_ROLE'
  | 'DUPLICATE_MEMBERSHIP'
  | 'INVITE_NOT_FOUND'
  | 'INVITE_EXPIRED'
  | 'INVITE_ALREADY_EXISTS'
  | 'CANNOT_INVITE_SELF'
  | 'CANNOT_KICK_FOUNDER'
  | 'FOUNDER_TRANSFER_REQUIRED'
  | 'INVALID_TRANSFER_TARGET'
  | 'SESSION_NOT_FOUND'
  | 'SESSION_ACTIVE'
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'CONCURRENT_MODIFICATION'
  | 'RATE_LIMITED';

export class SquadError extends Error {
  public readonly code: SquadErrorCode;
  public readonly context: Record<string, unknown>;
  public readonly recoverable: boolean;
  public readonly retryable: boolean;
  public readonly suggestedAction?: string;

  constructor(
    code: SquadErrorCode,
    message: string,
    context: Record<string, unknown> = {},
    options: {
      recoverable?: boolean;
      retryable?: boolean;
      suggestedAction?: string;
      cause?: Error;
    } = {}
  ) {
    super(message, { cause: options.cause });
    this.name = 'SquadError';
    this.code = code;
    this.context = context;
    this.recoverable = options.recoverable ?? false;
    this.retryable = options.retryable ?? false;
    this.suggestedAction = options.suggestedAction;
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      context: this.context,
      recoverable: this.recoverable,
      retryable: this.retryable,
      suggestedAction: this.suggestedAction,
      cause: this.cause instanceof Error ? this.cause.message : undefined,
    };
  }
}

export class RepositoryError extends SquadError {
  constructor(
    operation: string,
    cause: unknown,
    context?: Record<string, unknown>
  ) {
    const message = cause instanceof Error ? cause.message : String(cause);
    super(
      'NETWORK_ERROR',
      `Repository operation failed: ${operation} - ${message}`,
      { operation, ...context },
      {
        retryable: true,
        recoverable: true,
        suggestedAction: 'Retry the operation or check network connection',
        cause: cause instanceof Error ? cause : undefined,
      }
    );
    this.name = 'RepositoryError';
  }
}

// Specific error factories for domain scenarios
export const SquadErrors = {
  notFound: (squadId: string) => new SquadError(
    'SQUAD_NOT_FOUND',
    `Squad ${squadId} not found`,
    { squadId },
    { recoverable: false }
  ),

  squadFull: (squadId: string, current: number, max: number) => new SquadError(
    'SQUAD_FULL',
    `Squad ${squadId} is at capacity (${current}/${max})`,
    { squadId, current, max },
    { recoverable: false, suggestedAction: 'Increase max members or remove inactive members' }
  ),

  insufficientPermissions: (userId: string, action: string, required: string, actual?: string) => new SquadError(
    'INSUFFICIENT_PERMISSIONS',
    `User ${userId} lacks permission for ${action}. Required: ${required}, Actual: ${actual || 'none'}`,
    { userId, action, required, actual },
    { recoverable: false, suggestedAction: 'Request role upgrade from squad founder' }
  ),

  duplicateMembership: (userId: string, existingSquadId: string) => new SquadError(
    'DUPLICATE_MEMBERSHIP',
    `User ${userId} is already in squad ${existingSquadId}`,
    { userId, existingSquadId },
    { recoverable: true, suggestedAction: 'Leave current squad before joining new one' }
  ),

  inviteExpired: (inviteId: string, expiredAt: number) => new SquadError(
    'INVITE_EXPIRED',
    `Invite ${inviteId} expired at ${new Date(expiredAt).toISOString()}`,
    { inviteId, expiredAt },
    { recoverable: false, suggestedAction: 'Request a new invite from squad admin' }
  ),

  concurrentModification: (squadId: string, field: string) => new SquadError(
    'CONCURRENT_MODIFICATION',
    `Squad ${squadId} was modified by another user while editing ${field}`,
    { squadId, field },
    { retryable: true, recoverable: true, suggestedAction: 'Refresh and retry the operation' }
  ),

  networkError: (operation: string, cause: unknown) => new SquadError(
    'NETWORK_ERROR',
    `Network error during ${operation}`,
    { operation, cause: String(cause) },
    { retryable: true, recoverable: true, suggestedAction: 'Check connection and retry' }
  ),

  rateLimited: (operation: string, retryAfter: number) => new SquadError(
    'RATE_LIMITED',
    `Rate limited for ${operation}. Retry after ${retryAfter}ms`,
    { operation, retryAfter },
    { retryable: true, recoverable: true, suggestedAction: `Wait ${Math.ceil(retryAfter / 1000)} seconds` }
  ),
};
