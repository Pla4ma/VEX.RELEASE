/**
 * Notification formatters
 * Shared formatting utilities for notification components
 */

export function formatCompactNumber(num: number): string {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}
