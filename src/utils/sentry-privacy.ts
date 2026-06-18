/**
 * Sentry Privacy Utilities
 *
 * Hash user identifiers before sending to Sentry to prevent PII exposure.
 * All Sentry calls MUST use these utilities — never pass raw userId, email,
 * name, or other PII in tags, extras, or breadcrumbs.
 */

/**
 * One-way hash a userId for Sentry breadcrumbs/extras.
 * Produces a stable, non-reversible identifier like "user_1a2b3c".
 * Deterministic: same input always produces the same output.
 */
export function hashUserId(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return `user_${Math.abs(hash).toString(16)}`;
}

/**
 * Strip sensitive keys from a context object before passing to Sentry.
 * Redacts email, name, phone, address, ip, location fields.
 */
export function sanitizeContext(
  context?: Record<string, unknown>,
): Record<string, unknown> | undefined {
  if (!context) return undefined;
  const sensitiveKeys = ['email', 'name', 'phone', 'address', 'ip', 'location'];
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(context)) {
    if (sensitiveKeys.some((sk) => key.toLowerCase().includes(sk))) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}
