/**
 * Error message sanitizer.
 *
 * Strips internal implementation details (table names, constraint names,
 * query structure) from error messages before rendering in UI.
 * All user-facing error display must pass through sanitizeErrorMessage().
 */
const DANGEROUS_PATTERNS = [
  /relation\s+"[^"]+"/gi,
  /table\s+"[^"]+"/gi,
  /constraint\s+"[^"]+"/gi,
  /column\s+"[^"]+"/gi,
  /schema\s+"[^"]+"/gi,
  /duplicate\s+key\s+value\s+violates/gi,
  /PGRST\d+/gi,
  /JWT[a-f0-9_-]{20,}/gi,
  /eyJ[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}/g,
  /Bearer\s+[a-zA-Z0-9._-]{20,}/gi,
];

export function sanitizeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return sanitize(error.message);
  }
  if (typeof error === 'string') {
    return sanitize(error);
  }
  return 'An unexpected error occurred. Please try again.';
}

function sanitize(raw: string): string {
  let sanitized = raw;
  for (const pattern of DANGEROUS_PATTERNS) {
    sanitized = sanitized.replace(pattern, '[redacted]');
  }
  sanitized = sanitized.slice(0, 300);
  return sanitized || 'An unexpected error occurred. Please try again.';
}
