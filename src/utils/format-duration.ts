/**
 * Formats a duration in seconds into a human-readable string.
 * Shows 'Xh Ym' when hours > 0, 'Xm' otherwise.
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

/**
 * Formats a duration in milliseconds into a human-readable string.
 * Converts ms to seconds, then delegates to formatDuration.
 */
export function formatDurationFromMs(ms: number): string {
  return formatDuration(Math.floor(ms / 1000));
}
